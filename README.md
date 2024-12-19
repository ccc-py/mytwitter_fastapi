# MyTwitter FastAPI

A Twitter clone built with FastAPI, SQLAlchemy, and modern frontend technologies.

## Features

- User authentication (register, login, logout)
- Tweet management (create, read, delete)
- User following system
- Modern, responsive UI
- RESTful API
- JWT-based authentication

## Tech Stack

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- JWT Authentication
- SQLite Database

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap 5

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/mytwitter_fastapi.git
cd mytwitter_fastapi
```

2. Create a virtual environment and activate it:
```bash
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
uvicorn main:app --reload
```

5. Open your browser and navigate to:
```
http://127.0.0.1:8000
```

## API Documentation

Once the application is running, you can access the API documentation at:
- Swagger UI: `http://127.0.0.1:8000/docs`
- ReDoc: `http://127.0.0.1:8000/redoc`

## Project Structure

```
mytwitter_fastapi/
├── app/
│   ├── __init__.py
│   ├── models.py
│   ├── database.py
│   ├── auth.py
│   └── routers/
│       ├── auth.py
│       ├── users.py
│       └── tweets.py
├── static/
│   ├── styles.css
│   └── app.js
├── templates/
│   ├── index.html
│   ├── login.html
│   └── register.html
├── main.py
├── requirements.txt
└── README.md
```

## Contributing

Feel free to open issues and pull requests!
