import prisma from "../config/db.js";

//get user settings
export const getUserSettings = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10) //'/user-settings/:userId'
        let settings = await prisma.userSettings.findUnique({
            where: { userId }
        })
        if (!settings) {
            //if no settings exist, create a default record.
            settings = await prisma.userSettings.create({
                data: {
                    userId,
                    darkMode: false,               // default value
                    notificationsEnabled: false,   // default value
                    notifyTime: '20:00',           // default value
                },
            });
        }
        res.json(settings)
    } catch (err) {
        next(err)
    }
}

//update user settings partially (patch)
export const updateUserSettings = async (req, res, next) => {
    try {
        const userId = parseInt(req.params.userId, 10)
        // destructure only the possible settings fields
        const { notificationsEnabled, notifyTime } = req.body

        //retrieve the current settings for default values
        const currentSettings = await prisma.userSettings.findUnique({
            where: { userId }
        })

        if (!currentSettings) {
            return res.status(404).json({ error: 'Settings not found' });
        }
        //merge the provided fields with the current settings
        const updatedSettings = await prisma.userSettings.update({
            where: { userId },
            data: {
                notificationsEnabled:
                    notificationsEnabled === undefined
                        ? currentSettings.notificationsEnabled
                        : notificationsEnabled,
                notifyTime:
                    notifyTime === undefined ? currentSettings.notifyTime : notifyTime
            }
        })
        res.json(updatedSettings)

    } catch (err) {
        next(err)
    }
}