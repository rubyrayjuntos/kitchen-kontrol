# Kitchen Kontrol

Kitchen Kontrol is a web application for managing kitchen operations. It allows users to view daily kitchen phases, role assignments, and upcoming absences. It also provides a way to complete daily logs, view reports, and access training materials.

## Technologies Used

*   **Frontend:**
    *   React
    *   Zustand for state management
    *   Lucide for icons
    *   Tailwind CSS for styling
*   **Backend:**
    *   Node.js
    *   Express
    *   SQLite for the database
    *   `express-validator` for input validation

## Getting Started

### Prerequisites

*   Node.js
*   npm

### Installation

1.  Clone the repository:
    ```
    git clone <repository-url>
    ```
2.  Install the dependencies:
    ```
    npm install
    ```

### Running the Application

1.  Start the backend server:
    ```
    node server.js
    ```
2.  Start the frontend development server:
    ```
    npm start
    ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Database

The database is a SQLite database located in the file `database.db`. The database schema is defined in `database-setup.js` and the database is seeded with initial data in `seed.js`.

### Tables

*   `phases`: Stores the daily kitchen phases.
*   `roles`: Stores the roles in the kitchen.
*   `tasks`: Stores the tasks for each role and phase.
*   `absences`: Stores the upcoming absences.
*   `training_modules`: Stores the training modules.
*   `user_progress`: Stores the progress of each user in the training modules.
*   `logs`: Stores the daily logs.
*   `log_entries`: Stores the entries for each log.
*   `log_status`: Stores the status of each log.
*   `planograms`: Stores the planograms.
*   `planogram_wells`: Stores the wells for each planogram.
*   `ingredients`: Stores the ingredients.

## API

The API is defined in `server.js` and the routes are organized in the `routes` directory.

### Endpoints

*   `GET /api/phases`: Returns all the kitchen phases.
*   `PUT /api/phases/:id`: Updates a kitchen phase.
*   `GET /api/roles`: Returns all the roles.
*   `PUT /api/roles/:id`: Updates a role.
*   `GET /api/tasks`: Returns all the tasks.
*   `GET /api/absences`: Returns all the absences.
*   `POST /api/absences`: Creates a new absence.
*   `PUT /api/absences/:id`: Updates an absence.
*   `DELETE /api/absences/:id`: Deletes an absence.
*   `GET /api/training-modules`: Returns all the training modules.
*   `POST /api/logs/:id/complete`: Marks a log as complete.
*   `GET /api/planograms`: Returns all the planograms.
*   `GET /api/planograms/:date`: Returns the planogram for a specific date.
*   `POST /api/planograms`: Creates a new planogram.
*   `PUT /api/planograms/:id`: Updates a planogram.
*   `GET /api/ingredients`: Returns all the ingredients.