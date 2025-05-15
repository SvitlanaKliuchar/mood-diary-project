import prisma from "../config/db.js";

// GET /api/art?since=2025-05-08&page=1&pageSize=30
//fetchArtPieces
export const fetchArtPieces = async (req, res, next) => {
    try {
        const userId = req.user.id
        const artPieces = await prisma.arts.findMany({
            where: {userId},
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                gifUrl: true,
                thumbnailUrl: true,
                title: true,
                createdAt: true,
            }
        })
        res.json(artPieces)
    } catch (err) {
        next(err)
    }
} 

// body: { gifUrl, thumbnailUrl, title }
//addArtPiece
export const addArtPiece = async (req, res, next) => {
    try {
        const userId = req.user.id
        const { gifUrl, thumbnailUrl, title = "Untitled"} = req.body
        
        if (!gifUrl || !thumbnailUrl)
            return res.status(400).json({ error: "gifUrl and thumbnailUrl are required." });
        
        
        const addedArtPiece = await prisma.arts.create({
            where: { userId },
            data: { userId, gifUrl, thumbnailUrl, title },
      select: {
        id: true,
        gifUrl: true,
        thumbnailUrl: true,
        title: true,
        createdAt: true,
      },
    });

    res.status(201).json(art);
    } catch (err) {
        next(err)        
    }
}

//deleteArtPiece
const deleteArtPiece = async (req, res, next) => {
    try {
        const userId = req.user.id
        const id = parseInt(req.params.id, 10)

        //verify ownership
        const existing = await prisma.arts.findUnique({ where: { id } })
        if (!existing || existing.userId !== userId)
            return res.status(404).json({ error: "Art piece not found." });
      
          await prisma.arts.delete({ where: { id } });
          res.status(204).send(); 
    } catch (err) {
        next(err)        
    }
}