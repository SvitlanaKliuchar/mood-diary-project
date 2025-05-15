import prisma from "../config/db.js";

//fetchArtPieces
const fetchArtPieces = async (req, res, next) => {
    try {
        const userId = req.user.id
        const artPieces = await prisma.arts.findMany({
            where: {userId},
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                gifUrl: true,
                title: true,
                createdAt: true,
                thumbnailUrl: true

            }
        })
        res.json(artPieces)
    } catch (err) {
        next(err)
    }
} 
//addArtPiece

//deleteArtPiece