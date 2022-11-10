import { type DatabaseTypes } from "@/database"

export const getOtherPlayer = (player: DatabaseTypes.Player) => {
    if(player !== 0) return player * -1 as DatabaseTypes.Player;
    return 0;
}