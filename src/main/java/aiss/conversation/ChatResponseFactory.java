package aiss.conversation;

import aiss.controller.main.ChatQueryResponse;
import aiss.conversation.intenthandler.*;
import aiss.model.luis.classes.Intent;

public class ChatResponseFactory {

	private static boolean weAreMakingMontage(Context context)
	{
		return context != null && (context.getContextType().equals(ContextType.MontageTheme)
				|| context.getContextType().equals(ContextType.MontageMusic));
	}
	
	public static ChatQueryResponse fromIntent(Intent intent, Context context)
	{
		switch (intent.getTopIntent())
		{
		// HELP
		case HelpIntent:
			return HelpHandler.generateResponse(intent, context);
		// COMMUNICATION CANCEL
		case CommunicationCancel:
			return CancelIntentHandler.generateResponse(intent,context);
		// COMMUNICATION CONFIRM
		case CommunicationConfirm:
			if(context.previousStateEquals("did-you-want-montage") || context.getContextType().equals(ContextType.MontageTheme))
			{
				//context = null;
				return CreateMontageHandler.generateMontage(intent, context, "AskTheme");
			}
			else if (context.previousStateEquals("montage-ask-music") || context.getContextType().equals(ContextType.MontageMusic))
			{
				context.setContextType(ContextType.MontageMusic);
				return CreateMontageHandler.generateMontage(intent, context, "AskMusic");
			}
			else 
			{
				return UnexpectedIntentHandler.generateResponse(intent, context);
			}
		// CREATE MONTAGE
		case CreateMontage:
			return CreateMontageHandler.generateMontage(intent, context, "CreateMontage");
		// DECIDE FOR ME
		case DecideForMe:
			if(weAreMakingMontage(context))
			{
				return CreateMontageHandler.generateMontage(intent, context, "DecideForMe");
			} else 
			{
				return UnexpectedIntentHandler.generateResponse(intent, context);
			}
		// GREETING	
		case Greeting:
			return GenericHandler.generateResponse(intent, "hello-intent", context);
		// THANKS	
		case Thanks:
			return GenericHandler.generateResponse(intent, "thanks-intent", context);
		// MONTAGE THEME INTENT
		case MontageThemeIntent:
			if(weAreMakingMontage(context))
			{
				return CreateMontageHandler.generateMontage(intent, context, "MontageTheme");
			} else 
			{
				return GenericHandler.generateResponse(intent, "did-you-want-montage", context);
			}
		// MUSIC DESCRIPTION
		case MusicDescription:
			if (weAreMakingMontage(context))
			{
				return CreateMontageHandler.generateMontage(intent, context, "MusicDescription");
			} else 
			{
				return GenericHandler.generateResponse(intent, "did-you-want-montage", context);
			}
		// NONE INTENT
		case None:
			return GenericHandler.generateResponse(intent, "unknown-intent", context);
		// SPECIFIC THEME
		case SpecificTheme:
			if (weAreMakingMontage(context))
			{
				return CreateMontageHandler.generateMontage(intent, context, "MontageTheme");
			} else 
			{
				return GenericHandler.generateResponse(intent, "did-you-want-montage", context);
			}
		case Insult:
			return GenericHandler.generateResponse(intent, "insult", context);
		case No:
			if (weAreMakingMontage(context))
			{
				return CreateMontageHandler.generateMontage(intent, context, "DecideForMe");
			}
			else
			{
				context = null;
				return GenericHandler.generateResponse(intent, "ok", context);
			}
		default:
			return null;
		}
	}
	
}
