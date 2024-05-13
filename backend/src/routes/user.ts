import { Hono } from "hono";
import { PrismaClient } from "@prisma/client/edge";
import { withAccelerate } from "@prisma/extension-accelerate";
import { sign, verify } from "hono/jwt";



export const userRouter = new Hono<{
    Bindings: {
      JWT_SECRET: string;
      DATABASE_URL: string;
    };
  }>();

userRouter.post("/signup", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try {
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: body.password,
        },
      });
  
      const token = await sign({ id: user.id }, c.env.JWT_SECRET);
  
      return c.json({ jwt: token });
    } catch (error) {
      c.status(411);
      return c.text("invalid username and password");
    }
  });
  
  userRouter.post("/signin", async (c) => {
    const prisma = new PrismaClient({
      datasourceUrl: c.env.DATABASE_URL,
    }).$extends(withAccelerate());
  
    const body = await c.req.json();
    try {
      const user = await prisma.user.findUnique({
        where: {
          email: body.email,
          password: body.password,
        },
      });
  
      if (!user) {
        c.status(403);
        return c.json({ error: "Incorrect credentials" });
      }
  
      const jwt = await sign({ id: user.id }, c.env.JWT_SECRET);
  
      return c.json({ jwt });
    } catch (error) {
      c.status(411);
      return c.text("invalid username and password");
    }
  });
  