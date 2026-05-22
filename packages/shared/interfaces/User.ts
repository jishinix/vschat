

export interface UserReference {
    id: string,
    name: string,
    publicKey: string
}

// ein abbild eines users aus der perspektive des anfragenden Nuters. Notiz ist also zb befüllt mit der notiz die der anfragende nutzer hinterlegt hat
export interface User extends UserReference {
    personalNote: string

}