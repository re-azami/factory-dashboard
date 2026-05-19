import { IApiInfo } from '../api.interface';

export type ApiEducationTypes =
    // MENTOR
    | 'EducationMentorList'
    | 'EducationMentorFull'
    | 'EducationMentorCreate'
    | 'EducationMentorUpdate'
    | 'EducationMentorDelete'
    | 'EducationMentorStatus'
    | 'EducationMentorUpload'
    // INSTITUTE
    | 'EducationInstituteList'
    | 'EducationInstituteFull'
    | 'EducationInstituteCreate'
    | 'EducationInstituteUpdate'
    | 'EducationInstituteDelete'
    | 'EducationInstituteStatus'
    // LOCATION
    | 'EducationLocationList'
    | 'EducationLocationCreate'
    | 'EducationLocationUpdate'
    | 'EducationLocationDelete'
    | 'EducationLocationStatus'
    // COURSE
    | 'EducationCourseList'
    | 'EducationCourseFull'
    | 'EducationCourseCreate'
    | 'EducationCourseUpdate'
    | 'EducationCourseDelete'
    | 'EducationCourseStatus'
    | 'EducationCourseCode'
    // STUDY
    | 'EducationStudyData'
    | 'EducationStudyList'
    | 'EducationStudyInfo'
    | 'EducationStudyCreate'
    | 'EducationStudyUpdate'
    | 'EducationStudyDelete'
    | 'EducationStudyCancel'
    | 'EducationStudyCanceled'
    | 'EducationStudyDone'
    | 'EducationStudyUnpaid'
    | 'EducationStudyLog'
    | 'EducationStudyCourse'
    | 'EducationStudyEducator'
    | 'EducationStudyExpense'
    | 'EducationStudyDepartment'
    | 'EducationStudyParticipant'
    | 'EducationStudyPayment'
    | 'EducationStudyExport'
    // EXPENSE
    | 'EducationExpenseList'
    | 'EducationExpenseCreate'
    | 'EducationExpenseUpdate'
    | 'EducationExpenseDelete'
    // PARTICIPANT
    | 'EducationParticipantList'
    | 'EducationParticipantCreate'
    | 'EducationParticipantDelete'
    // FINISH
    | 'EducationFinishParticipant'
    | 'EducationFinishSave'
    // REPORT
    | 'EducationReportStudy'
    | 'EducationReportCourse'
    | 'EducationReportInstitute'
    | 'EducationReportMentor'
    | 'EducationReportParticipant'
    | 'EducationReportPersonnel'
    // EXPORT
    | 'EducationExportCourse'
    | 'EducationExportCourseInstitute'
    | 'EducationExportCourseMentor'
    | 'EducationExportInstitute'
    | 'EducationExportMentor'
    | 'EducationExportParticipant'
    | 'EducationExportStudy'
    | 'EducationExportStudyParticipant'
    | 'EducationExportStudyExpense'
    | 'EducationExportPersonnel'
    // DASHBOARD
    | 'EducationDashboardCount'
    | 'EducationDashboardStudy';

export const ApiEducationTypesInfo: { [key in ApiEducationTypes]: IApiInfo } = {
    EducationMentorList: { method: 'GET', path: '/education/mentor', params: { query: false, page: false } },
    EducationMentorFull: { method: 'GET', path: '/education/mentor/full' },
    EducationMentorCreate: { method: 'POST', path: '/education/mentor' },
    EducationMentorUpdate: { method: 'PUT', path: '/education/mentor/:ID' },
    EducationMentorDelete: { method: 'DELETE', path: '/education/mentor/:ID' },
    EducationMentorStatus: { method: 'PATCH', path: '/education/mentor/:ID/status' },
    EducationMentorUpload: { method: 'PATCH', path: '/education/mentor/:ID/upload' },

    EducationInstituteList: { method: 'GET', path: '/education/institute', params: { query: false, page: false } },
    EducationInstituteFull: { method: 'GET', path: '/education/institute/full' },
    EducationInstituteCreate: { method: 'POST', path: '/education/institute' },
    EducationInstituteUpdate: { method: 'PUT', path: '/education/institute/:ID' },
    EducationInstituteDelete: { method: 'DELETE', path: '/education/institute/:ID' },
    EducationInstituteStatus: { method: 'PATCH', path: '/education/institute/:ID/status' },

    EducationLocationList: { method: 'GET', path: '/education/location', params: { query: false, page: false } },
    EducationLocationCreate: { method: 'POST', path: '/education/location' },
    EducationLocationUpdate: { method: 'PUT', path: '/education/location/:ID' },
    EducationLocationDelete: { method: 'DELETE', path: '/education/location/:ID' },
    EducationLocationStatus: { method: 'PATCH', path: '/education/location/:ID/status' },

    EducationCourseList: { method: 'GET', path: '/education/course', params: { query: false, page: false } },
    EducationCourseFull: { method: 'GET', path: '/education/course/full' },
    EducationCourseCreate: { method: 'POST', path: '/education/course' },
    EducationCourseUpdate: { method: 'PUT', path: '/education/course/:ID' },
    EducationCourseDelete: { method: 'DELETE', path: '/education/course/:ID' },
    EducationCourseStatus: { method: 'PATCH', path: '/education/course/:ID/status' },
    EducationCourseCode: { method: 'PATCH', path: '/education/course/:ID/code' },

    EducationStudyData: { method: 'GET', path: '/education/study/data' },
    EducationStudyList: { method: 'GET', path: '/education/study' },
    EducationStudyInfo: { method: 'GET', path: '/education/study/:ID' },
    EducationStudyCreate: { method: 'POST', path: '/education/study' },
    EducationStudyUpdate: { method: 'PUT', path: '/education/study/:ID' },
    EducationStudyDelete: { method: 'DELETE', path: '/education/study/:ID' },
    EducationStudyCancel: { method: 'PUT', path: '/education/study/:ID/cancel' },
    EducationStudyCanceled: { method: 'GET', path: '/education/study/canceled', params: { course: false, page: false } },
    EducationStudyDone: { method: 'GET', path: '/education/study/done', params: { course: false, page: false } },
    EducationStudyUnpaid: { method: 'GET', path: '/education/study/unpaid', params: { course: false, page: false } },
    EducationStudyLog: { method: 'GET', path: '/education/study/:ID/log' },
    EducationStudyCourse: { method: 'PATCH', path: '/education/study/:ID/course' },
    EducationStudyEducator: { method: 'PATCH', path: '/education/study/:ID/educator' },
    EducationStudyExpense: { method: 'PATCH', path: '/education/study/:ID/expense' },
    EducationStudyDepartment: { method: 'PATCH', path: '/education/study/:ID/department' },
    EducationStudyParticipant: { method: 'PATCH', path: '/education/study/:ID/participant' },
    EducationStudyPayment: { method: 'PATCH', path: '/education/study/:ID/payment' },
    EducationStudyExport: { method: 'POST', path: '/education/study/:ID/export' },

    EducationExpenseList: { method: 'GET', path: '/education/study/:STUDYID/expense' },
    EducationExpenseCreate: { method: 'POST', path: '/education/study/:STUDYID/expense' },
    EducationExpenseUpdate: { method: 'PUT', path: '/education/study/:STUDYID/expense/:ID' },
    EducationExpenseDelete: { method: 'DELETE', path: '/education/study/:STUDYID/expense/:ID' },

    EducationParticipantList: { method: 'GET', path: '/education/study/:STUDYID/participant' },
    EducationParticipantCreate: { method: 'POST', path: '/education/study/:STUDYID/participant' },
    EducationParticipantDelete: { method: 'DELETE', path: '/education/study/:STUDYID/participant/:ID' },

    EducationFinishParticipant: { method: 'POST', path: '/education/study/:STUDYID/finish/participant' },
    EducationFinishSave: { method: 'POST', path: '/education/study/:STUDYID/finish' },

    EducationReportStudy: { method: 'GET', path: '/education/report/study', params: { from: true, to: true } },
    EducationReportCourse: { method: 'GET', path: '/education/report/course/:ID' },
    EducationReportInstitute: { method: 'GET', path: '/education/report/institute/:ID' },
    EducationReportMentor: { method: 'GET', path: '/education/report/mentor/:ID' },
    EducationReportParticipant: { method: 'GET', path: '/education/report/participant/:ID' },
    EducationReportPersonnel: { method: 'GET', path: '/education/report/personnel', params: { from: true, to: true } },

    EducationExportCourse: { method: 'POST', path: '/education/export/course/:ID' },
    EducationExportCourseInstitute: { method: 'POST', path: '/education/export/course/:ID/institute' },
    EducationExportCourseMentor: { method: 'POST', path: '/education/export/course/:ID/mentor' },
    EducationExportInstitute: { method: 'POST', path: '/education/export/institute/:ID' },
    EducationExportMentor: { method: 'POST', path: '/education/export/mentor/:ID' },
    EducationExportParticipant: { method: 'POST', path: '/education/export/participant/:ID' },
    EducationExportStudy: { method: 'POST', path: '/education/export/study', params: { from: true, to: true } },
    EducationExportStudyParticipant: { method: 'POST', path: '/education/export/study/:ID/participant' },
    EducationExportStudyExpense: { method: 'POST', path: '/education/export/study/:ID/expense' },
    EducationExportPersonnel: { method: 'POST', path: '/education/export/personnel', params: { from: true, to: true } },

    EducationDashboardCount: { method: 'GET', path: '/education/dashboard/count' },
    EducationDashboardStudy: { method: 'GET', path: '/education/dashboard/study' },
};
