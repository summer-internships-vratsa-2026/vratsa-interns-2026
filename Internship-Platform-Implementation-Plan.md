# Internship Platform Implementation Plan

## 1. Project Setup

- [ ] Create Next.js App Router project with TypeScript
- [ ] Add Tailwind CSS
- [ ] Add shadcn/ui
- [ ] Add ESLint and Prettier
- [ ] Create `.env.example`
- [ ] Connect project to GitHub
- [ ] Create Vercel project
- [ ] Create Neon Postgres database
- [ ] Add database environment variables to Vercel and local `.env`

## 2. Core Stack

- [ ] Install database ORM: Drizzle or Prisma
- [ ] Configure database client
- [ ] Add migration setup
- [ ] Add seed script
- [ ] Add validation library, for example Zod
- [ ] Add password hashing
- [ ] Add email sending provider for verification/reset emails
- [ ] Add i18n library, preferably `next-intl`

## 3. Database Schema

- [ ] Create `users` table
- [ ] Add user roles: `ADMIN`, `MENTOR`, `STUDENT`, `CLIENT`
- [ ] Add email verification fields
- [ ] Add password reset token fields
- [ ] Create `groups` table
- [ ] Seed 3 internship groups
- [ ] Create `mentors` table
- [ ] Add `main_group_id` to mentors
- [ ] Create `mentor_groups` table for additional group access if needed
- [ ] Allow each group to have multiple mentors
- [ ] Allow each mentor to have one main responsible group
- [ ] Create `students` table
- [ ] Add student project roles: `SOFTWARE_DEVELOPER`, `MARKETING_EXPERT`, `PRODUCT_OWNER`
- [ ] Create `clients` table
- [ ] Create `teams` table
- [ ] Add team fields: name, group, classroom, school class, school, optional client
- [ ] Add school enum: `PPMG`, `PTG`
- [ ] Create `team_members` table
- [ ] Enforce one student can belong to one team only
- [ ] Enforce team size validation: 2–4 students
- [ ] Create `team_mentors` table
- [ ] Create `team_invites` table
- [ ] Create `tasks` table
- [ ] Create `task_groups` table for assigning one task to one or more groups
- [ ] Add task role targeting: all roles or selected roles
- [ ] Create `submissions` table
- [ ] Store submission URLs as JSON
- [ ] Create `submission_comments` table
- [ ] Create `submission_grades` table
- [ ] Enforce grade range: 1–10

## 4. Authentication

- [ ] Create registration page
- [ ] Create login page
- [ ] Create logout action
- [ ] Add password hashing
- [ ] Add email verification flow
- [ ] Add forgotten password page
- [ ] Add reset password page
- [ ] Add protected dashboard routes
- [ ] Add role-based access checks
- [ ] Redirect users based on role after login

## 5. Internationalization

- [ ] Configure Bulgarian as default language
- [ ] Configure English as secondary language
- [ ] Create `/bg` and `/en` route structure
- [ ] Create `messages/bg.json`
- [ ] Create `messages/en.json`
- [ ] Add language switcher
- [ ] Translate auth pages
- [ ] Translate dashboard layout
- [ ] Translate forms
- [ ] Translate validation messages
- [ ] Translate buttons, menus, empty states, and errors

## 6. Student Team Flow

- [ ] After registration, ask student to create or join a team
- [ ] Build create team page
- [ ] Allow first student to create team name
- [ ] Allow student to enter classroom
- [ ] Allow student to enter school class
- [ ] Allow student to select school: PPMG or PTG
- [ ] Allow student to select group
- [ ] Allow student to select their team role
- [ ] Create team invitation link generation
- [ ] Allow inviting students by email
- [ ] Create join team by unique link page
- [ ] Validate invite token
- [ ] Allow invited student to register or log in
- [ ] Allow invited student to choose their role
- [ ] Prevent duplicate student roles if you want only one of each role per team
- [ ] Prevent team from exceeding 4 students
- [ ] Give all team members equal team editing permissions
- [ ] Allow team members to update team info
- [ ] Allow team members to view team tasks
- [ ] Allow team members to submit task replies

## 7. Admin Team Management

- [ ] Create admin teams list page
- [ ] Add filters by group, school, class, mentor, client
- [ ] Create admin team detail page
- [ ] Allow admin to edit team name
- [ ] Allow admin to edit group
- [ ] Allow admin to edit classroom
- [ ] Allow admin to edit school class
- [ ] Allow admin to edit school
- [ ] Allow admin to assign/remove client
- [ ] Allow admin to assign/remove mentors
- [ ] Allow admin to add/remove team members
- [ ] Allow admin to change student roles
- [ ] Prevent invalid team size after edits
- [ ] Prevent student from being in multiple teams

## 8. Mentor Group Logic

- [ ] Add main responsible group for each mentor
- [ ] Allow admin to assign mentor’s main group
- [ ] Allow admin to assign several mentors to the same group
- [ ] Allow mentor to view all groups
- [ ] Allow mentor to view all teams
- [ ] Allow mentor to view all tasks
- [ ] Allow mentor to view all submissions
- [ ] Restrict mentor task creation to their main group
- [ ] Restrict mentor task reuse/apply action to their main group
- [ ] Allow mentor to comment on submissions from all groups
- [ ] Decide whether mentor can grade all groups or only their main group
- [ ] Implement selected grading permission rule

## 9. Tasks

- [ ] Create mentor task list page
- [ ] Create task detail page
- [ ] Create task creation form
- [ ] Add fields: title, description, assigned roles, deadline
- [ ] Let mentor create task only for their main group
- [ ] Let admin create task for one group
- [ ] Let admin create task for multiple groups
- [ ] Let admin create task for all groups
- [ ] Store group-specific deadlines
- [ ] Show tasks only to eligible teams based on group
- [ ] Show tasks only to eligible student roles when relevant
- [ ] Allow mentors to browse tasks from all groups
- [ ] Add “Apply to my group” button
- [ ] Ask mentor for new deadline when applying task
- [ ] Create reused task linked to original task
- [ ] Prevent duplicate application of the same task to the same group unless intended

## 10. Student Submissions

- [ ] Create task submission form
- [ ] Allow text reply
- [ ] Allow one or more URLs
- [ ] Validate URLs
- [ ] Allow editing submission before deadline
- [ ] Decide whether editing after deadline is allowed
- [ ] Show submission status: not submitted, submitted, late
- [ ] Show deadline clearly
- [ ] Show role targeting clearly
- [ ] Show existing comments and grades to students

## 11. Mentor Reviews and Grades

- [ ] Create submission review page
- [ ] Allow mentors to view submissions
- [ ] Allow mentors to add comments
- [ ] Allow mentors to add optional grade
- [ ] Validate grade from 1 to 10
- [ ] Allow mentor to update own grade
- [ ] Allow admin to edit/delete grades if needed
- [ ] Show grading history or latest grade only
- [ ] Add filters by group, team, task, role, grade status

## 12. Client Access

- [ ] Create client user role
- [ ] Allow admin to create/manage clients
- [ ] Allow admin to assign client to team
- [ ] Allow client to log in
- [ ] Restrict client to assigned team or teams
- [ ] Allow client to view team details
- [ ] Allow client to view submissions from assigned team
- [ ] Allow client to comment on submissions
- [ ] Prevent client from grading
- [ ] Prevent client from seeing unrelated teams if desired

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

- [ ] Seed admin user
- [ ] Seed 3 groups
- [ ] Seed sample mentors
- [ ] Assign mentor main groups
- [ ] Seed sample clients
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