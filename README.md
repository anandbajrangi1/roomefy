<div align="center">

# Roomefy

**Premium shared living for working professionals.**<br>
Furnished rooms in shared flats, from first enquiry to move-in to monthly rent, all on one platform.

![Next.js](https://img.shields.io/badge/Next.js_16-000000?style=flat-square&logo=nextdotjs&logoColor=white)
![React](https://img.shields.io/badge/React_19-20232A?style=flat-square&logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat-square&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat-square&logo=prisma&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)

</div>

---

## What it does

Roomefy helps corporate employees find **affordable, furnished rooms in shared flats** in prime locations across India. It also gives the operator a full back office to run the properties.

### For tenants
- **Search and browse** properties and rooms, with an amenities view for each room
- **Wishlist** rooms to come back to later
- **Enquire** about a room directly from its page
- **Tenant portal:** active lease, payment ledger, KYC and booking documents, and the option to serve notice
- **Maintenance and complaints:** raise a request and track it until it's resolved
- **Help centre and support tickets**

### For the operations team
| Area | What you can do |
| :-- | :-- |
| **Dashboard** | Occupancy, revenue and property performance analytics |
| **Inquiries (CRM)** | Lead pipeline with activity log, assignment to staff, manual entry and CSV bulk import. Convert a lead to a tenant in one step |
| **Properties & rooms** | Create listings, add rooms, set status and pricing |
| **On-boarding & tenants** | Verify documents, assign tenants to rooms, manage leases, generate monthly invoices |
| **Complaints & support** | Triage maintenance complaints and support tickets |
| **Procurement & expenses** | Track purchases and operating costs per property |
| **Employees** | Staff records and status |
| **Data** | Export reports |

Users have one of four roles: **Admin**, **Owner**, **Broker** or **Tenant**. In-app notifications and transactional email (Mailjet) keep everyone in the loop.

## Tech stack

| Layer | Choice |
| :-- | :-- |
| Framework | Next.js 16 (App Router, Server Actions), React 19, TypeScript |
| Database | PostgreSQL via Prisma ORM |
| Auth | NextAuth (credentials + email OTP) with bcrypt-hashed passwords |
| Uploads | UploadThing (room photos, KYC documents) |
| Email | Mailjet |
| Charts | Chart.js |
| Styling | Tailwind CSS 4 |

## Project structure

```
src/
├── app/
│   ├── actions/        # Server Actions: admin, tenant, inquiry, profile, support, wishlist, notifications
│   ├── api/            # NextAuth, OTP, registration, UploadThing routes
│   ├── dashboard/
│   │   ├── admin/      # Operations back office (one view per module)
│   │   └── tenant/     # Tenant portal, bookings, profile
│   ├── rooms/[id]/     # Room detail page
│   ├── search/         # Search results
│   ├── wishlist/
│   └── help/
├── components/         # UI: PropertyCard, SearchBar, LeadDrawer, CSVImportModal, ...
├── hooks/
└── lib/                # Prisma client, mailer, UploadThing helpers
prisma/
├── schema.prisma       # User, Property, Room, Booking, Payment, Inquiry, Complaint, ...
└── seed.ts
```

## Getting started

**Requirements:** Node.js 20+ and a PostgreSQL database (Neon works well).

```bash
git clone https://github.com/anandbajrangi1/roomefy.git
cd roomefy
npm install            # also runs `prisma generate`
```

Create a `.env` file:

```env
DATABASE_URL="postgresql://user:password@host/db?sslmode=require"
NEXTAUTH_SECRET="a-long-random-string"
NEXT_PUBLIC_APP_URL="http://localhost:3000"

MAILJET_API_KEY=""
MAILJET_SECRET_KEY=""
MAIL_FROM="no-reply@roomefy.com"

UPLOADTHING_TOKEN=""
```

Set up the database and run the app:

```bash
npx prisma migrate deploy   # apply migrations
npx prisma db seed          # optional: sample data
npm run dev                 # http://localhost:3000
```

### Create the production admin

The admin password is read from the environment, so it never lives in the code:

```bash
ADMIN_PASSWORD="choose-a-strong-password" npx tsx scripts/init-prod.ts
```

## Scripts

| Command | What it does |
| :-- | :-- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Lint with ESLint |

---

<div align="center">
<sub>Built by <a href="https://github.com/anandbajrangi1">Anand Bajrangi</a> · <a href="https://evolvcode.com">Evolvcode Solutions</a></sub>
</div>
