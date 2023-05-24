// The parsePayload function converts openAI's stream of data
// into a JSON object from which we can extract the data.
export const parsePayload = (payload: string) => {
	const result = payload
				.replace(/data:\s*/g, "")
				.replace(/[\r\n\t]/g, "")
				.split("}{")
				.join("},{");
	const cleanedJsonString = `[${result}]`;
	try {
		let parsed = JSON.parse(cleanedJsonString);
		if (parsed.length === 1) {
			return
		}
		let last = parsed[parsed.length - 1];
		let content = last.choices[0].delta.content;
		return content;
	} catch (e) {
		throw new Error("Failed to parse JSON");
	}
}