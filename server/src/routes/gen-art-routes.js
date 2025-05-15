import { Router } from "express";
import authenticate from "../middleware/auth-middleware.js";
import { fetchArtPieces, addArtPiece, deleteArtPiece } from "../controllers/gen-art-controller.js";

const genArtRouter = Router()

genArtRouter.get('/', authenticate, fetchArtPieces)

genArtRouter.post('/', authenticate, addArtPiece)

genArtRouter.delete('/:id', authenticate, deleteArtPiece)