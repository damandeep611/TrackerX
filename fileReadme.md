### Todo features to add 

1. let the use also share the learning journey as a page so that others can also see what the user is learning and how much 
time the user has been spending so the user should be able to share the buildxskill.com/username/react/learning and then 
a page would show the canvas style graph or a simple analytics page with used resources of github projects 


1. the getUserID async funciton is in skillTaskAction so move that to utility later for more cleaner code
2.  Input validation is missing in server actions which opens security vulnerabilities, so implement input sanitation and length limit on input fields and format validation as data is being rendered unsafely there is risk of XSS,  
3. Implementation of rate limiting to avoid DDos attacks , so can also use @upstash ratelimiting 
4. read more about CSRF protection on server actions , so also verify that actions are called from your domain only , can also implement in memory rate limiting using libraries if there is only one server instance running as it will be fast,
  - Database based rate limiting but there can be some cons which will make the database slower 
  -- (preferred method) - next js middleware with reddish/upstash as it will run at edge and will cache requests before they enter your server actions 
  ---- third party options i.e - clouddlare rate limiting but if deployed on cloudflare 
5. In the delete skill card , use database transactions as there are three operations i.e deleting time logs, then tasks and then finally skill card ,but if one of the opration fails then there would be data inconsistencies so use database transactions to avoid it and if any one action fails it will be restored to old good database state 
6. there is also a potential for UUID collision  in the skill card and task card actions as only partial parts of UUID is being used 
7. Use proper error handling as there are chances of error leaks in some of the functions and server actions functions and use generic error handling in client side 


## To understand 
1. what is database connection pooling 
2. Caching data to avoid too many db requests 
3. Streaming for long operations 


## Todos 

-- Input Validation 
1. Add Zod schema to all server actions 
2. Validate every input parameter 

-- Rate Limiting 
1. Add to all server actions 
2. Use upstash or reddis 

-- Error Handling 
1. Use generic error messages for client side functions 
2. Proper logging for debugging 

-- Advance security 
1. add request logging
2. implement soft deletes 
3. add data validation at database level 
4. Implement sessions for users in auth 

-- remove components 
1. featureGrid component
-- 


### Todos for performance 

#### Caching and performance related 

1. Currently the analytics section queries are aggregation (count , sum , avg) across potentially hundered/thousands of rows , so 
they are doing full scans of the table, processing many rows and computing results on the fly , these are making the UI and responses lag as unnecessary computation is being done, 


#### Schema problems and indexing 
1. 