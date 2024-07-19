#https://github.com/SidJain1412/StreamingFastAPI/blob/main/fastapp.py

MARKDOWN_API_KEY = "2 MARKDOWN API KEY HERE"

from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
import requests
from os.path import isfile

app = FastAPI()

#enabling CORS so the api can be accessed by an external web app (the frontend application)
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

"""
@app.get("/generatePlaybook/")
def Playbook(clientURL: str = Query(...)):
    #generate the playbook's HTML given a client's website's url
    #for a very basic sales playbook, gpt needs to know what GlyphicAI can offer, the customer's requirements/product and thus how Glyphic will help
    glyphicExplanation = "I work at Glyphic AI. Glyphic AI offers a Sales Copilot that enhances sales team performance through advanced AI tools. The platform unifies communications across various channels, automates routine tasks, and provides AI-driven insights for better lead qualification and personalized outreach. By analyzing sales data and interactions, Glyphic helps identify and create personalized upsell opportunities, streamlining workflows and improving efficiency. The result is increased productivity, more effective sales strategies, and higher revenue growth for sales teams."

    clientWebsite = "Here is a potential client's website in the form of markdown:"
    clientURL = clientURL

    prompt = "
    Please generate a sales strategy we can use to acquire this client.
    The strategy should include what the client's product(s) does, what the client needs and how our sales co-pilot can help. Please format the answer as an unstyled HTML page with no additional text.
    "

    markdown = GetWebpageMarkdown(clientURL)["markdown"] #may need to truncate markdown in future to fit context window
    response = GetChatGPTReply([glyphicExplanation, clientWebsite, markdown, prompt])

    return { 'playbook': response }
"""
    

#use 2markdown API to convert HTML data from URL into markdown to send to chatGPT
#https://stackoverflow.com/questions/25491090/how-to-use-python-to-execute-a-curl-command
@app.get("/getMarkdown/")
def GetWebpageMarkdown(url: str = Query(...)):
    #check cache
    path = HashURLToFilePathurl(url)
    if isfile(path): #we can just access the cache
        f = open(path, "r")
        markdown = f.read()
        f.close()

        return { 'markdown': markdown }

    #otherwise we need to send a request via the 2markdown API
    headers = {
        'X-Api-Key': MARKDOWN_API_KEY,
    }
    json_data = {
        'url': url,
    }
    response = requests.post('https://2markdown.com/api/v1/url2md', headers=headers, json=json_data)
    json = response.json()
    markdown = json["article"]

    #cache the markdown for next time
    CacheMarkdown(url, markdown)

    return { 'markdown': response.text }

def CacheMarkdown(url, content):
    #don't want to make unnecessary calls to expensive API, so we can cache the results in local storage under a hash of the URL
    path = HashURLToFilePathurl(url)
    f = open(path, "w")
    f.write(content)
    f.close()


def HashURLToFilePathurl(url):
    #create a filename-safe string from a url
    hash = "".join(c for c in url if c.isalpha() or c.isdigit() or c==' ').rstrip()
    return "MarkdownCaches/" + hash + ".txt"



def get_news(company, api_key):
    url = f'https://newsapi.org/v2/everything?q={company}&apiKey={api_key}'
    response = requests.get(url)
    if response.status_code == 200:
        return response.json()
    else:
        return None

def print_news(news):
    if news:
        articles = news['articles']
        for article in articles:
            print(f"Title: {article['title']}")
            print(f"Date: {['publishedAt']}")
            print(f"Source: {article['source']['name']}")
            print(f"URL: {article['url']}")
            print("\n")
    else:
        print("Failed to retrieve news")


GetWebpageMarkdown("https://www.mongodb.com/products/platform/atlas-vector-search")