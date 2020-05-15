package aiss.conversation.intenthandler;

import java.util.ArrayList;
import java.util.List;

import aiss.controller.main.ChatQueryResponse;
import aiss.conversation.ChatResponseSupplier;
import aiss.conversation.Context;
import aiss.conversation.ContextType;
import aiss.model.luis.classes.Intent;

/**
 * Handler for basic chat responses without context (E.g. Hello, Thanks)
 *
 */
public class HelpHandler {

	public static ChatQueryResponse generateResponse(Context context) {
		if (context.getContextType().equals(ContextType.MontageTheme))
		{
			return GenericHandler.generateResponse("help-theme", context);
		}
		else if (context.getContextType().equals(ContextType.MontageMusic))
		{
			return GenericHandler.generateResponse("help-music", context);
		}
		else 
		{
			return GenericHandler.generateResponse("help-general", context);
		}
	}

}
