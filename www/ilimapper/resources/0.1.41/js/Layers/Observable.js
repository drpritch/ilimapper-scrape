define(["dojo/_base/declare", "dojo/Stateful"], function (declare, Stateful)
{
	return declare(Stateful,
	{
		set: function (propertyName, value)
		{
			if (this[propertyName] === value)
				return;

			this.inherited(arguments);
		}
	});
});
