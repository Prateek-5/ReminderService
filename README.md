# Reminder Service

Async notification service for the flight-booking system. Consumes booking-confirmation
messages from a RabbitMQ queue and sends transactional emails. Also runs a cron scheduler
for time-based reminders. Completely decoupled from the booking flow — it receives events,
it doesn't block them.

Part of a 5-service system: [API Gateway](https://github.com/Prateek-5/APIGateway) · [Auth Service](https://github.com/Prateek-5/Auth_Service) · [Booking Service](https://github.com/Prateek-5/AirTicketBookingService) · [Flight & Search Service](https://github.com/Prateek-5/FlightAndSearchService) · **Reminder Service**

---

## What it does

```
Two trigger paths:

1. RabbitMQ consumer
   Booking Service publishes → REMINDER_BINDING_KEY queue
   └── subscribeEvents() picks up message
         └── sends confirmation email via Nodemailer (SMTP)

2. Cron scheduler (node-cron)
   jobs() runs on startup
   └── periodic queries for upcoming bookings
         └── sends reminder emails ahead of departure
```

HTTP endpoint (internal):
```
POST /api/v1/tickets    Create a ticket record (for cron-based reminders)
```

---

## Architecture

```
Booking Service
     │
     │  AMQP publish to REMINDER_BINDING_KEY
     ▼
 RabbitMQ
     │
     │  amqplib subscribe
     ▼
Reminder Service
  ├── subscribeEvents()  ← parses message, routes by service type
  │     └── sendBasicEmail()  ← Nodemailer SMTP
  └── jobs()             ← node-cron, polls DB for upcoming reminders
        └── sendBasicEmail()
```

**Message contract** (published by Booking Service):
```json
{
  "subject": "Booking confirmed for userId 42",
  "content": "Total amount: ₹4200",
  "recepientEmail": "user@example.com",
  "notificationTime": "2024-02-06T06:20:35.000Z",
  "service": "CREATE_TICKET"
}
```

`subscribeEvents` reads the `service` field to route to the right handler.
`CREATE_TICKET` triggers an immediate confirmation email and persists a ticket record
for later cron-based departure reminders.

---

## Key design decisions

**Why async messaging instead of a direct HTTP call from the Booking Service?**
Booking confirmation should not be blocked by, or coupled to, email delivery.
RabbitMQ decouples the two: if this service is down, messages queue up and are
processed when it restarts. The user gets their booking confirmed regardless of email status.

**Two trigger paths for one concern.**
Immediate confirmation (RabbitMQ) handles the "booking just happened" notification.
Cron handles the "flight is tomorrow" reminder. Both use the same email utility — different
triggers, same delivery mechanism.

**Ticket records bridge the two paths.**
When a `CREATE_TICKET` message is consumed, a ticket row is persisted. The cron job
queries these rows against departure times to know who to remind and when.

---

## Stack

| Concern | Library |
|---|---|
| HTTP server | Express 4 |
| Message queue | amqplib (RabbitMQ / AMQP) |
| Email | Nodemailer (SMTP) |
| Cron scheduler | node-cron |
| ORM | Sequelize + Sequelize CLI |
| Database | MySQL |

---

## Setup

Requires: MySQL, RabbitMQ (local or Docker), and a working SMTP account.

```bash
npm install
npx sequelize-cli db:migrate
```

Create `.env`:
```
PORT=3003
DB_NAME=reminder_db
DB_USER=root
DB_PASSWORD=yourpassword
DB_HOST=localhost
EMAIL_ID=your@gmail.com
EMAIL_PASSWORD=your_app_password
MESSAGE_BROKER_URL=amqp://localhost
REMINDER_BINDING_KEY=reminder-binding-key
```

```bash
npm start   # runs via nodemon
```

Start **after** RabbitMQ is up. The Booking Service can start before or after —
messages will queue in RabbitMQ and be consumed when this service connects.
