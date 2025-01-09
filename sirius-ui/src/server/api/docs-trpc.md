### Working with tRPC

Basic REST request (GET Method) no function params

```
  getAllHosts: publicProcedure.query(async () => {
    try {
      const response = await httpClient.get("host/");
      const hosts = response.data;
      ...
```

Sending a param from client to server tRPC

```
  getHost: publicProcedure
    .input(z.object({ id: z.string() })) // Define the expected input using Zod or a similar schema validation library
    .query(async ({ input }) => {
      const { id } = input;
      ...
```
