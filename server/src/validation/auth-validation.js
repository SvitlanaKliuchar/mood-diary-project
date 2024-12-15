//Ensures the request payload contains valid data (e.g., a valid mood and optional note). 
//Without it, the app might crash or behave unexpectedly when processing invalid data.
import { z } from zod