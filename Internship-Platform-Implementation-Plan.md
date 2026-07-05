# Internship Platform Implementation Plan

## 1. Project Setup

- [x] Create Next.js App Router project with TypeScript
- [x] Add Tailwind CSS
- [x] Add shadcn/ui
- [x] Add ESLint and Prettier
- [x] Create `.env.example`
- [x] Connect project to GitHub
- [ ] Create Vercel project
- [ ] Create Neon Postgres database
- [ ] Add database environment variables to Vercel and local `.env`

## 2. Core Stack

- [x] Install database ORM: Drizzle or Prisma
- [x] Configure database client
- [x] Add migration setup
- [x] Add seed script
- [x] Add validation library, for example Zod
- [x] Add password hashing
- [x] Add email sending provider for verification/reset emails
- [x] Add i18n library, preferably `next-intl`

## 3. Database Schema

- [x] Create `users` table
- [x] Add user roles: `ADMIN`, `MENTOR`, `STUDENT`, `CLIENT`
- [x] Add email verification fields
- [x] Add password reset token fields
- [x] Create `groups` table
- [x] Seed 3 internship groups
- [x] Create `mentors` table
- [x] Add `main_group_id` to mentors
- [x] Create `mentor_groups` table for additional group access if needed
- [x] Allow each group to have multiple mentors
- [x] Allow each mentor to have one main responsible group
- [x] Create `students` table
- [x] Add student project roles: `SOFTWARE_DEVELOPER`, `MARKETING_EXPERT`, `PRODUCT_OWNER`
- [x] Create `clients` table
- [x] Create `teams` table
- [x] Add team fields: name, group, classroom, school class, school, optional client
- [x] Add school enum: `PPMG`, `PTG`
- [x] Create `team_members` table
- [x] Enforce one student can belong to one team only
- [x] Enforce team size validation: 2–4 students
- [x] Create `team_mentors` table
- [x] Create `team_invites` table
- [x] Create `tasks` table
- [x] Create `task_groups` table for assigning one task to one or more groups
- [x] Add task role targeting: all roles or selected roles
- [x] Create `submissions` table
- [x] Store submission URLs as JSON
- [x] Create `submission_comments` table
- [x] Create `submission_grades` table
- [x] Enforce grade range: 1–10

## 4. Authentication

- [x] Create registration page
- [x] Create login page
- [x] Create logout action
- [x] Add password hashing
- [x] Add email verification flow
- [x] Add forgotten password page
- [x] Add reset password page
- [x] Add protected dashboard routes
- [x] Add role-based access checks
- [x] Redirect users based on role after login

## 5. Internationalization

- [x] Configure Bulgarian as default language
- [x] Configure English as secondary language
- [x] Create `/bg` and `/en` route structure
- [x] Create `messages/bg.json`
- [x] Create `messages/en.json`
- [x] Add language switcher
- [x] Translate auth pages
- [x] Translate dashboard layout
- [x] Translate forms
- [x] Translate validation messages
- [x] Translate buttons, menus, empty states, and errors

## 6. Student Team Flow

- [x] After registration, ask student to create or join a team
- [x] Build create team page
- [x] Allow first student to create team name
- [x] Allow student to enter classroom
- [x] Allow student to enter school class
- [x] Allow student to select school: PPMG or PTG
- [x] Allow student to select group
- [x] Allow student to select their team role
- [x] Create team invitation link generation
- [x] Allow inviting students by email
- [x] Create join team by unique link page
- [x] Validate invite token
- [x] Allow invited student to register or log in
- [x] Allow invited student to choose their role
- [x] Prevent duplicate student roles if you want only one of each role per team
- [x] Prevent team from exceeding 4 students
- [x] Give all team members equal team editing permissions
- [x] Allow team members to update team info
- [x] Allow team members to view team tasks
- [x] Allow team members to submit task replies

## 7. Admin Team Management

- [x] Create admin teams list page
- [x] Add filters by group, school, class, mentor, client
- [x] Create admin team detail page
- [x] Allow admin to edit team name
- [x] Allow admin to edit group
- [x] Allow admin to edit classroom
- [x] Allow admin to edit school class
- [x] Allow admin to edit school
- [x] Allow admin to assign/remove client
- [x] Allow admin to assign/remove mentors
- [x] Allow admin to add/remove team members
- [x] Allow admin to change student roles
- [x] Prevent invalid team size after edits
- [x] Prevent student from being in multiple teams

## 8. Mentor Group Logic

- [x] Add main responsible group for each mentor
- [x] Allow admin to assign mentor’s main group
- [x] Allow admin to assign several mentors to the same group
- [x] Allow mentor to view all groups
- [x] Allow mentor to view all teams
- [x] Allow mentor to view all tasks
- [x] Allow mentor to view all submissions
- [x] Restrict mentor task creation to their main group
- [x] Restrict mentor task reuse/apply action to their main group
- [x] Allow mentor to comment on submissions from all groups
- [x] Decide whether mentor can grade all groups or only their main group
- [x] Implement selected grading permission rule

## 9. Tasks

- [x] Create mentor task list page
- [x] Create task detail page
- [x] Create task creation form
- [x] Add fields: title, description, assigned roles, deadline
- [x] Let mentor create task only for their main group
- [x] Let admin create task for one group
- [x] Let admin create task for multiple groups
- [x] Let admin create task for all groups
- [x] Store group-specific deadlines
- [x] Show tasks only to eligible teams based on group
- [x] Show tasks only to eligible student roles when relevant
- [x] Allow mentors to browse tasks from all groups
- [x] Add “Apply to my group” button
- [x] Ask mentor for new deadline when applying task
- [x] Create reused task linked to original task
- [x] Prevent duplicate application of the same task to the same group unless intended

## 10. Student Submissions

- [x] Create task submission form
- [x] Allow text reply
- [x] Allow one or more URLs
- [x] Validate URLs
- [x] Allow editing submission before deadline
- [x] Decide whether editing after deadline is allowed
- [x] Show submission status: not submitted, submitted, late
- [x] Show deadline clearly
- [x] Show role targeting clearly
- [x] Show existing comments and grades to students

## 11. Mentor Reviews and Grades

- [x] Create submission review page
- [x] Allow mentors to view submissions
- [x] Allow mentors to add comments
- [x] Allow mentors to add optional grade
- [x] Validate grade from 1 to 10
- [x] Allow mentor to update own grade
- [x] Allow admin to edit/delete grades if needed
- [x] Show grading history or latest grade only
- [x] Add filters by group, team, task, role, grade status

## 12. Client Access

- [x] Create client user role
- [x] Allow admin to create/manage clients
- [x] Allow admin to assign client to team
- [x] Allow client to log in
- [x] Restrict client to assigned team or teams
- [x] Allow client to view team details
- [x] Allow client to view submissions from assigned team
- [x] Allow client to comment on submissions
- [x] Prevent client from grading
- [x] Prevent client from seeing unrelated teams if desired

## 13. Admin Users

- [ ] Create admin users page
- [ ] List all users
- [ ] Filter users by role
- [ ] Create users manually if needed
- [ ] Edit user role
- [ ] Edit user name/email
- [ ] Mark email as verified manually if needed
- [ ] Disable or delete users if needed
- [ ] Reset user password manually if needed

## 14. Dashboard

- [ ] Create shared dashboard layout
- [ ] Create role-specific dashboard cards
- [ ] Student dashboard: team, active tasks, deadlines, submissions
- [ ] Mentor dashboard: main group, tasks, pending reviews, recent submissions
- [ ] Admin dashboard: users, teams, groups, tasks, submissions
- [ ] Client dashboard: assigned teams, recent submissions, comments

## 15. Permissions Matrix

- [ ] Implement `canViewTeam`
- [ ] Implement `canEditTeam`
- [ ] Implement `canCreateTask`
- [ ] Implement `canApplyTaskToGroup`
- [ ] Implement `canSubmitTask`
- [ ] Implement `canCommentSubmission`
- [ ] Implement `canGradeSubmission`
- [ ] Implement `canManageUsers`
- [ ] Implement `canManageClients`
- [ ] Implement server-side permission checks
- [ ] Hide unavailable UI actions client-side

## 16. Seed Data

- [x] Seed admin user
- [ ] Seed 3 groups
- [ ] Seed sample mentors
- [ ] Assign mentor main groups
- [x] Seed sample clients
- [ ] Seed sample students
- [ ] Seed sample teams
- [ ] Seed sample tasks
- [ ] Seed sample submissions

## 17. Testing Checklist

- [ ] Student can register
- [ ] Student can verify email
- [ ] Student can create team
- [ ] Student can invite teammates
- [ ] Invited student can join team
- [ ] Student cannot join two teams
- [ ] Team cannot exceed 4 students
- [ ] Mentor can see all groups
- [ ] Mentor can create tasks only for main group
- [ ] Mentor can apply task only to main group
- [ ] Admin can manage all teams
- [ ] Admin can create tasks for all groups
- [ ] Student can submit URLs
- [ ] Mentor can comment
- [ ] Mentor can optionally grade 1–10
- [ ] Client can comment but not grade
- [ ] Bulgarian UI loads by default
- [ ] English UI works
- [ ] Deployment works on Vercel

## 18. Deployment

- [ ] Add Neon database URL to Vercel
- [ ] Add auth secret to Vercel
- [ ] Add app URL to Vercel
- [ ] Add email provider API key to Vercel
- [ ] Run production migrations
- [ ] Seed production admin user
- [ ] Test registration on production
- [ ] Test email verification on production
- [ ] Test password reset on production
- [ ] Test role permissions on production

## 19. Version 2 Public Website

- [ ] Create public landing page
- [ ] Create public teams showcase
- [ ] Create public project pages
- [ ] Allow admins to mark submissions as public
- [ ] Allow public visitors to view approved student work
- [ ] Add parent/interested visitor view
- [ ] Add SEO metadata
- [ ] Add shareable project links
