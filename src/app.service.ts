import { Injectable } from "@nestjs/common";
import { data } from "./data";
import { IconService } from "./icon/icon.service";
import { AdminService } from "./admin/admin.service";
import { MediaService } from "./media/media.service";
import { MessageService } from "./message/message.service";
import { PhoneService } from "./phone/phone.service";
import { SocialService } from "./social/social.service";
import { StudentService } from "./student/student.service";
import { TeacherService } from "./teacher/teacher.service";
import { WebMediaService } from "./web-media/web-media.service";
import { WebPhoneService } from "./web-phone/web-phone.service";
import { WebSocialService } from "./web-social/web-social.service";
import { WebStudentService } from "./web-student/web-student.service";
import { WebTeacherService } from "./web-teacher/web-teacher.service";
import { WebService } from "./web/web.service";

@Injectable()
export class AppService {
  constructor(
    private readonly webService: WebService,
    private readonly adminService: AdminService,
    private readonly iconService: IconService,
    private readonly socialService: SocialService,
    private readonly phoneService: PhoneService,
    private readonly mediaService: MediaService,
    private readonly teacherService: TeacherService,
    private readonly studentService: StudentService,
    private readonly messageService: MessageService,
    private readonly webSocialService: WebSocialService,
    private readonly webPhoneService: WebPhoneService,
    private readonly webMediaService: WebMediaService,
    private readonly webTeacherService: WebTeacherService,
    private readonly webStudentService: WebStudentService
  ) {}

  async web(isVisit: boolean = false) {
    const activeWeb = await this.webService.getActiveWeb();
    if (isVisit && activeWeb) {
      // Update the visits counter but don't block the response if something goes wrong
      try {
        await this.webService.increaseVisits(activeWeb.id);
      } catch (error) {
        console.error("Failed to update visits counter", error);
      }
    }
    return activeWeb;
  }

  async init() {
    console.log("Initialization started...");

    // 0. Create Admins
    const createdAdmins = await Promise.all(
      data.admins.map((admin) => this.adminService.create(admin))
    );
    console.log("Created Admins:", createdAdmins);

    // 1. Create Icons
    const createdIcons = await Promise.all(
      data.icons.map((icon) => this.iconService.create(icon))
    );
    console.log("Created Icons:", createdIcons);

    // 2. Create Socials
    const createdSocials = await Promise.all(
      data.socials.map((social) => this.socialService.create(social))
    );
    console.log("Created Socials:", createdSocials);

    // 3. Create Phones
    const createdPhones = await Promise.all(
      data.phones.map((phone) => this.phoneService.create(phone))
    );
    console.log("Created Phones:", createdPhones);

    // 4. Create Media
    const createdMedia = await Promise.all(
      data.media.map((media) => this.mediaService.create(media))
    );
    console.log("Created Media:", createdMedia);

    // 5. Create Teachers
    const createdTeachers = await Promise.all(
      data.teachers.map((teacher) => this.teacherService.create(teacher))
    );
    console.log("Created Teachers:", createdTeachers);

    // 6. Create Students
    const createdStudents = await Promise.all(
      data.students.map((student) => this.studentService.create(student))
    );
    console.log("Created Students:", createdStudents);

    // 7. Create Messages
    const createdMessages = await Promise.all(
      data.messages.map((message) => this.messageService.create(message))
    );
    console.log("Created Messages:", createdMessages);

    // 8. Create Web
    const createdWeb = await this.webService.create(data.web);
    console.log("Created Web:", createdWeb);

    // 9. Create Relations
    // WebSocial
    await Promise.all(
      data.web_social.map((relation) =>
        this.webSocialService.create({
          web_id: createdWeb.id.toString(),
          social_id: createdSocials[relation.social_id - 1].id.toString(),
        })
      )
    );
    console.log("Created WebSocial relations");

    // WebPhone
    await Promise.all(
      data.web_phone.map((relation) =>
        this.webPhoneService.create({
          web_id: createdWeb.id.toString(),
          phone_id: createdPhones[relation.phone_id - 1].id.toString(),
        })
      )
    );
    console.log("Created WebPhone relations");

    // WebMedia
    await Promise.all(
      data.web_media.map((relation) => {
        const { web_id, media_id, ...rest } = relation;
        return this.webMediaService.create({
          ...rest,
          web_id: createdWeb.id.toString(),
          media_id: createdMedia[relation.media_id - 1].id.toString(),
        });
      })
    );
    console.log("Created WebMedia relations");

    // WebTeacher
    await Promise.all(
      data.web_teacher.map((relation) =>
        this.webTeacherService.create({
          web_id: createdWeb.id.toString(),
          teacher_id: createdTeachers[relation.teacher_id - 1].id.toString(),
          order: relation.order,
        })
      )
    );
    console.log("Created WebTeacher relations");

    // WebStudent
    await Promise.all(
      data.web_student.map((relation) =>
        this.webStudentService.create({
          web_id: createdWeb.id,
          student_id: createdStudents[relation.student_id - 1].id,
          order: relation.order,
        })
      )
    );
    console.log("Created WebStudent relations");

    console.log("Initialization completed successfully!");

    return { message: "Initialization completed" };
  }
}
