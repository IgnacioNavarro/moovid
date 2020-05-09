package aiss.conversation;

import aiss.conversation.intenthandler.IntentHandler;
import aiss.model.luis.classes.Intent;

public class IntentHandlerFactory {

	public static IntentHandler fromIntent(Intent intent, Context context)
	{
		switch (intent.getTopIntent())
		{
		case CommunicationCancel:
			return new CancelIntentHandler(intent, context);
		case CommunicationConfirm:
			return new CancelIntentHandler(intent, context);
		case CreateMontage:
			return new CancelIntentHandler(intent, context);
		case DecideForMe:
			return new DecideForMeHandler(intent, context);
		case Greeting:
			return new HelloHandler(intent, context);
		case MontageThemeIntent:
			return new CancelIntentHandler(intent, context);
		case MusicDescription:
			return new CancelIntentHandler(intent, context);
		case None:
			return new CancelIntentHandler(intent, context);
//		case SpecificTheme:
//			return new CancelIntentHandler(intent, context);
		default:
			return null;
		}
	}
	
}
