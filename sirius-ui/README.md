# Sirius UI

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Database Management

### Initial Credentials

- **Username**: `admin`
- **Password**: value from `INITIAL_ADMIN_PASSWORD`

### Resetting the Database

If you've modified the database during testing and need to reset it:

**Inside the container:**

```bash
docker exec -it sirius-ui npx prisma db push --force-reset
docker exec -it sirius-ui npm run seed
```

**Or from your local machine (if running locally):**

```bash
cd sirius-ui
npx prisma db push --force-reset
npm run seed
```

This will:

1. Reset the database schema
2. Recreate the admin user using `INITIAL_ADMIN_PASSWORD`

**Note:** Database files (`*.db`, `*.sqlite`) are gitignored to prevent committing test data. Each developer maintains their own local database state.

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.
