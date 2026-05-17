# NearHands

NearHands is a full-stack hyper-local service marketplace where customers can discover nearby service providers, post service requests, communicate through real-time chat, receive notifications, and leave reviews.

## Project Structure

```text
NearHands/
├── .github/
├── backend/
├── frontend/
├── docker-compose.yml
└── README.md
```

## Main Features

- User registration and login
- JWT-based authentication
- Password reset flow
- Customer and provider roles
- Public provider profiles
- Service listing creation and management
- Service request board
- Provider responses to requests
- Real-time chat using WebSockets
- Real-time notifications
- Reviews and ratings
- Responsive frontend UI

## Tech Stack

### Backend
- Django
- Django REST Framework
- PostgreSQL
- Django Channels
- Redis
- Daphne
- JWT Authentication

### Frontend
- React
- Vite
- Tailwind CSS
- Axios
- React Router

### DevOps / Tooling
- Docker Compose
- GitHub Actions CI

## Local Development

### Backend and Services with Docker

From the project root:

```bash
docker compose up --build
```

### Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The frontend usually runs at:

```text
http://localhost:5173
```

The backend usually runs at:

```text
http://localhost:8000
```

## Environment Files

Example environment files are included in the project.

- `backend/.env.example`
- `frontend/.env.example`

Create local `.env` files from them before running the project.

## Testing

### Backend

```bash
docker compose exec web python manage.py check
docker compose exec web python manage.py test
```

### Frontend

```bash
cd frontend
npm run lint
npm run build
```

## Author

Developed by **Al Amin**

- GitHub: https://github.com/alaminpiyal2002
- LinkedIn: https://www.linkedin.com/in/alaminpiyal
- Email: alamin876123@gmail.com
