import zod from 'zod';
import { RoomEntrance } from '@prisma/client';


export const registerAgentSchema = zod.object({
 agentCard: zod.object.
});

export const logInSchema = zod.object({
  email: zod.string().email().min(1),
  password: zod
    .string()
    .regex(
      /^(?=.*[0-9])(?=.*[!@#$%^&*(),.?":{}|<>])[A-Za-z0-9!@#$%^&*(),.?":{}|<>]{8,}$/g
    ),
});
