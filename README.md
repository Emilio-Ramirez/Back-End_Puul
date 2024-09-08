# Back-End_Puul

## Project setup

<details>
<summary>Start</summary>

1. Clone the repository and navigate to the project directory

    ```bash
    git clone https://github.com/Emilio-Ramirez/Back-End_Puul.git 
    cd back-end_chalenge
    ```

2. Install dependencies

    ```bash
    npm install
    ```

3. Create a `.env` file in the root of the project and add the following environment variables:

    ```bash
    PORT=3000
    DB_HOST=localhost
    DB_PORT=5432
    DB_USER=postgres
    DB_PASSWORD=postgres
    DB_NAME=puul
    ```

4. Since the DB is hosted you only need to generate the prisma client.

    ```bash
    npx prisma  generate
    ```

5. Start the development server

    ```bash
    npm run dev
    ```

</details>

## Database

### Hosting

For this project, I decided to host the database on [ElephantSQL](https://www.elephantsql.com/). This is a PostgreSQL database as a free service.

### DB Schema

<details>
<summary>See Diagram</summary>

```marmaid
erDiagram
    User {
        int id PK
        string name
        string email
        enum role
        int completedTasksCount
        float totalTasksCost
    }
    Task {
        int id PK
        string title
        string description
        float estimatedHours
        date dueDate
        enum status
        float cost
    }
    UserTask {
        int userId FK
        int taskId FK
    }

    User ||--o{ UserTask : "assigned to"
    Task ||--o{ UserTask : "assigned to"

```

</details>

### ORM Prisma

[Prisma](https://www.prisma.io) was selected as the ORM for this project due to its:

1. Type-safe database access, enhancing code reliability
2. Intuitive schema definition language
3. Powerful query API, supporting complex filtering and sorting
4. Built-in migration system for easy schema evolution
5. Efficient performance with features like query batching
6. TypeScript integration
7. Strong community support and ecosystem

## API Endpoints

<details>
<summary>Endpoints</summary>

### Users

1. Create User
   - POST `/users`
   - Creates a new user with name, email, and role (member or admin)

2. List Users
   - GET `/users`
   - Lists all users with filters for name, email, and role
   - Includes completed task count and total cost of completed tasks per user

### Tasks

1. Create Task
   - POST `/tasks`
   - Creates a new task with title, description, estimated hours, due date, status (active or completed), assigned users, and monetary cost

2. List Tasks
   - GET `/tasks`
   - Lists tasks with sorting from most to least recent
   - Includes filters for due date, task name, assigned user, and user name/email
   - Supports mul                  tiple simultaneous filters

3. Update Task
   - PUT `/tasks/:id`
   - Updates any task detail, including user reassignment and estimated hours

4. Delete Task
   - DELETE `/tasks/:id`
   - Deletes a specific task

5. Analytics
   - GET `/analytics`
   - Provides two relevant statistics in the context of the project:
     a. Average task completion time
     b. User productivity ranking based on completed tasks and their costs

</details>

