const OPEN_AI_API_KEY = "API KEY HERE";

let GPT_MODEL = "gpt-4o"; //gpt-4 is much more expensive than gpt-3.5-turbo, however it seems to be 'worth' it for accuracy

let CONTEXT: { role: string, content: string }[] = []; //global context object, which can be edited throughout the app; acts as a centralisd store of the conversations

const GetChatGPTReply = async (prompts: string[], callback: (deltaContent: string) => void, stream: boolean, context?: string): Promise<void> => {
    if (context != undefined) { //add all the new information to the context window
        CONTEXT.push({
            "role": "system",
            "content": context
        })
    }
    for (const prompt of prompts) {
        CONTEXT.push({
            "role": "user",
            "content": prompt
        })
    }

    //send request to API and execute callback for every chunk, providing content in the delta
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify({
            "model": GPT_MODEL,
            "messages": CONTEXT,
            "temperature": 0.8,
            "top_p": 0.99,
            "stream": stream
        })
    });

    if (stream == true) {
        //https://umaar.com/dev-tips/269-web-streams-openai/
        const decoder = new TextDecoder();
        let finalDataIncomplete = ""; //final item in decodedChunk is generally incomplete

        let overallReply = "";

        //@ts-expect-error
        for await (const chunk of response.body!) {
            const decodedChunk = finalDataIncomplete + decoder.decode(chunk);

            const splitData = decodedChunk.split("\n\n");
            finalDataIncomplete = splitData[splitData.length - 1]; //final item is incomplete
            splitData.pop();

            for (const data of splitData) {
                const delta = data.replace("data: ", "")
                if (delta != "[DONE]") {
                    const content = JSON.parse(delta)["choices"][0]["delta"]["content"];
                    if (content != undefined) { //undefined on ultimate/penultimate chunk
                        overallReply += content;

                        //we also want to split this content into individual letters
                        const letters = content.split('');

                        for (const letter of letters) {
                            callback(letter); //executes callback whenever data is returned from stream;
                            await Wait(1);
                        }
                    }
                }
            }
        }

        CONTEXT.push({
            "role": "assistant",
            "content": overallReply
        });
    }
    else {
        const json = await response.json();
        const content = json["choices"][0]["message"]["content"];
        CONTEXT.push({
            "role": "assistant",
            "content": content
        });

        callback(content);
    }
}

const Wait = (ms: number) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(undefined);
        }, ms);
    })
}