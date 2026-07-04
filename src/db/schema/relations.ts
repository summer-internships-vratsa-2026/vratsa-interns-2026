import { relations } from "drizzle-orm";

import { clients } from "./clients";
import { groups } from "./groups";
import { mentorGroups, mentors } from "./mentors";
import { students } from "./students";
import { submissionComments, submissionGrades, submissions } from "./submissions";
import { teamFeedback, teamFeedbackComments } from "./team-feedback";
import { taskGroups, tasks } from "./tasks";
import { topics } from "./topics";
import { teamInvites, teamMembers, teamMentors, teams } from "./teams";
import { users } from "./users";

export const usersRelations = relations(users, ({ one, many }) => ({
  mentor: one(mentors, { fields: [users.id], references: [mentors.userId] }),
  student: one(students, { fields: [users.id], references: [students.userId] }),
  client: one(clients, { fields: [users.id], references: [clients.userId] }),
  authoredTeamFeedback: many(teamFeedback, { relationName: "teamFeedbackAuthor" }),
  completedTeamFeedback: many(teamFeedback, { relationName: "teamFeedbackDoneBy" }),
  teamFeedbackComments: many(teamFeedbackComments),
}));

export const groupsRelations = relations(groups, ({ many }) => ({
  teams: many(teams),
  taskGroups: many(taskGroups),
  mentorGroups: many(mentorGroups),
  mentors: many(mentors),
}));

export const mentorsRelations = relations(mentors, ({ one, many }) => ({
  user: one(users, { fields: [mentors.userId], references: [users.id] }),
  mainGroup: one(groups, { fields: [mentors.mainGroupId], references: [groups.id] }),
  mentorGroups: many(mentorGroups),
  teamMentors: many(teamMentors),
}));

export const mentorGroupsRelations = relations(mentorGroups, ({ one }) => ({
  mentor: one(mentors, { fields: [mentorGroups.mentorId], references: [mentors.id] }),
  group: one(groups, { fields: [mentorGroups.groupId], references: [groups.id] }),
}));

export const studentsRelations = relations(students, ({ one, many }) => ({
  user: one(users, { fields: [students.userId], references: [users.id] }),
  teamMembers: many(teamMembers),
}));

export const clientsRelations = relations(clients, ({ one, many }) => ({
  user: one(users, { fields: [clients.userId], references: [users.id] }),
  teams: many(teams),
}));

export const teamsRelations = relations(teams, ({ one, many }) => ({
  group: one(groups, { fields: [teams.groupId], references: [groups.id] }),
  client: one(clients, { fields: [teams.clientId], references: [clients.id] }),
  members: many(teamMembers),
  mentors: many(teamMentors),
  invites: many(teamInvites),
  submissions: many(submissions),
  feedbackItems: many(teamFeedback),
}));

export const teamMembersRelations = relations(teamMembers, ({ one }) => ({
  team: one(teams, { fields: [teamMembers.teamId], references: [teams.id] }),
  student: one(students, { fields: [teamMembers.studentId], references: [students.id] }),
}));

export const teamMentorsRelations = relations(teamMentors, ({ one }) => ({
  team: one(teams, { fields: [teamMentors.teamId], references: [teams.id] }),
  mentor: one(mentors, { fields: [teamMentors.mentorId], references: [mentors.id] }),
}));

export const teamInvitesRelations = relations(teamInvites, ({ one }) => ({
  team: one(teams, { fields: [teamInvites.teamId], references: [teams.id] }),
  invitedBy: one(users, { fields: [teamInvites.invitedByUserId], references: [users.id] }),
}));

export const topicsRelations = relations(topics, ({ many }) => ({
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  createdBy: one(users, { fields: [tasks.createdByUserId], references: [users.id] }),
  topic: one(topics, { fields: [tasks.topicId], references: [topics.id] }),
  sourceTask: one(tasks, {
    fields: [tasks.sourceTaskId],
    references: [tasks.id],
    relationName: "taskReuse",
  }),
  derivedTasks: many(tasks, { relationName: "taskReuse" }),
  taskGroups: many(taskGroups),
}));

export const taskGroupsRelations = relations(taskGroups, ({ one, many }) => ({
  task: one(tasks, { fields: [taskGroups.taskId], references: [tasks.id] }),
  group: one(groups, { fields: [taskGroups.groupId], references: [groups.id] }),
  submissions: many(submissions),
}));

export const submissionsRelations = relations(submissions, ({ one, many }) => ({
  taskGroup: one(taskGroups, { fields: [submissions.taskGroupId], references: [taskGroups.id] }),
  team: one(teams, { fields: [submissions.teamId], references: [teams.id] }),
  comments: many(submissionComments),
  grade: one(submissionGrades, {
    fields: [submissions.id],
    references: [submissionGrades.submissionId],
  }),
}));

export const submissionCommentsRelations = relations(submissionComments, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionComments.submissionId],
    references: [submissions.id],
  }),
  author: one(users, { fields: [submissionComments.authorUserId], references: [users.id] }),
}));

export const submissionGradesRelations = relations(submissionGrades, ({ one }) => ({
  submission: one(submissions, {
    fields: [submissionGrades.submissionId],
    references: [submissions.id],
  }),
  gradedBy: one(users, { fields: [submissionGrades.gradedByUserId], references: [users.id] }),
}));

export const teamFeedbackRelations = relations(teamFeedback, ({ one, many }) => ({
  team: one(teams, { fields: [teamFeedback.teamId], references: [teams.id] }),
  author: one(users, {
    fields: [teamFeedback.authorUserId],
    references: [users.id],
    relationName: "teamFeedbackAuthor",
  }),
  doneBy: one(users, {
    fields: [teamFeedback.doneByUserId],
    references: [users.id],
    relationName: "teamFeedbackDoneBy",
  }),
  comments: many(teamFeedbackComments),
}));

export const teamFeedbackCommentsRelations = relations(teamFeedbackComments, ({ one }) => ({
  feedback: one(teamFeedback, {
    fields: [teamFeedbackComments.feedbackId],
    references: [teamFeedback.id],
  }),
  author: one(users, { fields: [teamFeedbackComments.authorUserId], references: [users.id] }),
}));
