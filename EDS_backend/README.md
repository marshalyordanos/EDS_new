# Expert Database System (EDS_backend)

A Django REST API for registering experts, managing their CVs, and supporting authentication and password reset functionality.

## Features

- User registration and authentication (JWT)
- Expert profile management
- CV upload and generation
- Password reset via email
- Swagger/OpenAPI documentation

## Tech Stack

- Python 3.13
- Django 5.2
- Django REST Framework
- SimpleJWT
- drf-yasg (Swagger docs)
- Postgres

## Requirements

Install dependencies with:

```sh
pip install -r requirements.txt
```

## Environment Setup

1. Clone the repository:
    ```sh
    git clone https://github.com/afridatai/EDS_backend.git
    cd EDS_backend
    ```
2. Create a virtual environment and activate it:
    ```sh
    python -m venv env
    source env/bin/activate  # On Windows: env\Scripts\activate
    ```
3. Copy `.env.example` to `.env` and set your environment variables.

## Database Migration

```sh
python manage.py makemigrations
python manage.py migrate
```

## Running the Project

```sh
python manage.py runserver
```

## API Endpoints

- `POST /api/auth/login/` — User login
- `POST /api/password_reset/` — Request password reset
- `POST /api/password_reset/confirm/` — Confirm password reset
- `GET /api/v1/users/` — List users
- `GET /api/v1/experts/` — List experts
- `POST /api/v1/experts/<expert_id>/build-cv/` — Build or update CV

Full API docs at `/swagger/` and `/redoc/`.


## License

[MIT](LICENSE)

## Contact

For questions, contact [ziontaa9@gmail.com](mailto:ziontaa9@gmail.com).