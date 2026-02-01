import {
  AgentExecutor,
  RequestContext as BaseRequestContext,
  ExecutionEventBus,
} from "@a2a-js/sdk/server";
import { AgentCard, Message, AGENT_CARD_PATH, Part } from "@a2a-js/sdk";
import { v4 as uuidv4 } from "uuid";
import {
  OstridAdapterActions,
  OstridMessage,
} from "src/constants/a2a.bindings";

type RequestContext = BaseRequestContext & { userMessage?: OstridMessage };

function createTextResponse(
  contextId: string,
  text: string,
  parts: any[] = [],
): OstridMessage {
  return {
    kind: "message",
    messageId: uuidv4(),
    role: "agent",
    parts: [{ kind: "text", text }, ...parts],
    contextId,
  };
}

export default class OstridAdapterExecutor implements AgentExecutor {
  // private suiClient: SuiClient;

  constructor() {
    // this.suiClient = new SuiClient({ url: SUI_RPC_URL });
  }

  async execute(
    requestContext: RequestContext,
    eventBus: ExecutionEventBus,
  ): Promise<void> {
    const { userMessage: message } = requestContext;
    if (!message) {
      eventBus.publish(
        createTextResponse(
          requestContext.contextId!,
          "Error: No message received in request context.",
        ),
      );
      eventBus.finished();
      return;
    }

    const ostridExtension = message?.ostrid;
    const action = ostridExtension?.action;
    try {
      switch (action) {
        case OstridAdapterActions.RAISE_TASK_JOB:
          await this.handleRaiseTaskJob(requestContext, eventBus);
          break;
        case OstridAdapterActions.DISCOVERY:
          await this.handleDiscovery(requestContext, eventBus);
          break;
        case OstridAdapterActions.ATTEST:
          await this.handleAttestation(requestContext, eventBus);
          break;
        case OstridAdapterActions.NEGOTIATION:
          await this.handleNegotiationTrigger(requestContext, eventBus);
          break;
        default:
          // Generic fallback / greeting
          eventBus.publish(
            createTextResponse(
              requestContext.contextId!,
              "Ostrid Adapter ready. " +
                "Send a message with ostrid.action extension containing mode: 'raise-task-job', 'discovery', 'attest', etc.",
            ),
          );
      }

      eventBus.finished();
    } catch (err: any) {
      console.error("[OstridAdapterExecutor]", err);

      eventBus.publish(
        createTextResponse(
          requestContext.contextId!,
          `Error processing request: ${err.message || "Unknown error"}`,
        ),
      );
      eventBus.finished();
    }
  }

  private async handleRaiseTaskJob(
    ctx: RequestContext,
    bus: ExecutionEventBus,
  ): Promise<void> {
    const intentJson = this.extractIntentFromMessage(ctx.userMessage);

    if (!intentJson) {
      bus.publish(
        createTextResponse(ctx.contextId!, "Missing task intent in message."),
      );
      return;
    }

    // Example: call Sui Move entry function
    // const txb = new TransactionBlock();

    // txb.moveCall({
    //   target: `${OSTRID_PACKAGE_ID}::task_job::raise_task_job`,
    //   arguments: [
    //     txb.pure(intentJson), // serialized intent
    //     txb.pure("solver"), // default mode – can come from extension
    //     txb.object("0x6"), // clock object (Sui standard)
    //   ],
    // });

    // const result = await this.suiClient.signAndExecuteTransactionBlock({
    //   signer: ADAPTER_KEYPAIR,
    //   transactionBlock: txb,
    //   options: { showEffects: true, showObjectChanges: true },
    // });

    // const jobId = result.effects?.created?.[0]?.reference?.objectId;

    const jobId =  uuidv4();

    bus.publish(
      createTextResponse(
        ctx.contextId!,
        `Task-job created successfully!\nJob ID: ${jobId}`,
        [
          {
            kind: "text",
            text: "You can now monitor status or trigger negotiation.",
          },
        ],
      ),
    );

    // Emit observability event
    // bus.emit("task_created", {
    //   jobId,
    //   digest: result.digest,
    //   intent: intentJson,
    // });
  }

  // ────────────────────────────────────────────────
  //  Simple placeholder handlers – expand these next
  // ────────────────────────────────────────────────
  private async handleDiscovery(ctx: RequestContext, bus: ExecutionEventBus) {
    // Query Sui registry object → return candidate list
    bus.publish(
      createTextResponse(
        ctx.contextId!,
        "Discovery mode triggered. Candidate pool query not yet implemented.",
      ),
    );
  }

  private async handleNegotiationTrigger(
    ctx: RequestContext,
    bus: ExecutionEventBus,
  ) {
    bus.publish(
      createTextResponse(
        ctx.contextId!,
        "Negotiation trigger received. Solver / auction logic not yet implemented.",
      ),
    );
  }

  private async handleAttestation(ctx: RequestContext, bus: ExecutionEventBus) {
    bus.publish(
      createTextResponse(
        ctx.contextId!,
        "Attestation received. Validation & escrow release logic pending.",
      ),
    );
  }

  // ────────────────────────────────────────────────
  // Helpers
  // ────────────────────────────────────────────────
  private extractIntentFromMessage(msg?: OstridMessage): any | null {
    if (!msg?.parts) return null;

    for (const part of msg.parts) {
      if (part.kind === "text" && part.text.includes("intent:")) {
        try {
          // naive extraction – improve with structured parts later
          const jsonStart = part.text.indexOf("{");
          if (jsonStart >= 0) {
            return JSON.parse(part.text.slice(jsonStart));
          }
        } catch {}
      }
      if (part.kind === "file") {
        return part.file;
      }
    }
    return null;
  }

  // Optional – if you want to support task cancellation
  async cancelTask(taskId: string): Promise<void> {
    // TODO: call Sui cancel / refund escrow entry function
    console.log(`Cancel requested for task ${taskId} – not implemented yet`);
  }
}
