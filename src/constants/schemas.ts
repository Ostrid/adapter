import zod from 'zod';
import { RoomEntrance } from '@prisma/client';


export const createUserSchema = zod.object({
  email: zod.string().email().min(1),
  name: zod.string().nullish(),
  phone: zod.string().nullish(),
  password: zod
    .string()
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/g
    ),
});

export const logInSchema = zod.object({
  email: zod.string().email().min(1),
  password: zod
    .string()
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/g
    ),
});
