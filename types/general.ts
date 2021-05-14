// place for custom typescript interfaces/"models"


export interface User {
    authenticated: boolean;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
}

  
export interface GeneralState {
    user?: User;
}