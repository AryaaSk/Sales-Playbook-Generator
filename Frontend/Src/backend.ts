//just going to call api to retrieve markdown
//all ChatGPT calls will be made from the client

const Playbook = async (clientURL: string, callback: (deltaContent: string) => void) => {
    //generate the playbook's HTML given a client's website's url
    //for a very basic sales playbook, gpt needs to know what GlyphicAI can offer, the customer's requirements/product and thus how Glyphic will help
    const glyphicExplanation = "I work at Glyphic AI. Glyphic AI offers a Sales Copilot that enhances sales team performance through advanced AI tools. The platform unifies communications across various channels, automates routine tasks, and provides AI-driven insights for better lead qualification and personalized outreach. By analyzing sales data and interactions, Glyphic helps identify and create personalized upsell opportunities, streamlining workflows and improving efficiency. The result is increased productivity, more effective sales strategies, and higher revenue growth for sales teams."

    const clientWebsite = "Here is a potential client's website in the form of markdown:"

    const salesPrompt = `
    Please generate a sales strategy we can use to acquire this client.
    The strategy should include what the client's product(s) does, what the client needs and how our sales co-pilot can help. Please format the answer as unstyled HTML with no additional text.
    `;

    const markdown = await GetWebpageMarkdown(clientURL) //may need to truncate markdown in future to fit context window

    const context = "You are a sales agency helping Glyphic AI sell their product (provide all answers in HTML format)";

    await GetChatGPTReply([glyphicExplanation, clientWebsite, markdown, salesPrompt], callback, true, context);
    //await GetChatGPTReply(["Tell me some recent news about Enso Connect, including the title, date and a link to a news article"], callback)
}

const GetWebpageMarkdown = async (url: string) => { //use Python API
    const response = await (await fetch(`http://127.0.0.1:8000/getMarkdown/?url=${url}`)).json();
    const markdown = response["markdown"];
    return markdown;
}


const NEWS_API_KEY = "8208eb63c5ec4302aded6e89e71a223b";
const GetNews = async () => {
    console.log('called')

    //convert url into name, assumes function is called after initial sales call
    await GetChatGPTReply(["What is the company/product's name? Format the answer with just the name and no additional text."], async (name: string) => {
        const newsEndpoint = `https://newsapi.org/v2/everything?q=${name}&apiKey=${NEWS_API_KEY}`;
        const json = await (await fetch(newsEndpoint)).json();

        console.log(json)
        const articles = json["articles"];
        for (const article of articles) {
            console.log(article);
        }
    }, false);
}