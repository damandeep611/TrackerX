// to format the url to show in the skillTask card 

export function formatUrl(url: string): string {
  try{
    const urlObj = new URL(url)
    const hostname = urlObj.hostname.replace(/^www.\./, "")

    //get the path without leading and trailing slashes
    const path = urlObj.pathname.replace(/^\/|\/$/g,"")
    //Extract the last part of the path if it exists
    const pathParts = path.split("/").filter(Boolean)
    const lastPathPart = pathParts.length > 0 ? pathParts[pathParts.length - 1] : ""

    //if there's a meaning path part , add it and show it 
    if(lastPathPart){
      return `${hostname}: ${lastPathPart}`
    }
    //if no meaning part exists just show domain 
    return hostname
  }catch(error){
    console.log(`Failed to format url: ${error}`)
    //if url parsing fails , return a portion of the original url 
    return url.length > 30 ? url.substring(0, 30) + "..." : url
  }
}