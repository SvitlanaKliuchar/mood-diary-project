//i need to add gen art pieces to db (urls to be precise)
//i also need to delete them
//and i need to fetch them

import { Router } from "express";
import authenticate from "../middleware/auth-middleware.js";

const genArtRouter = Router()

genArtRouter.get('/', authenticate, fetchArtPieces)

genArtRouter.post('/', authenticate, addArtPiece)

genArtRouter.delete('/:id', authenticate, deleteArtPiece)