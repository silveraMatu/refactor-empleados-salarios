export class AppError extends Error{
    public readonly statusCode: number

    constructor(message: string, statusCode: number = 400,){
        super(message)
        this.statusCode = statusCode
        Object.setPrototypeOf(this, new.target.prototype)
    }
}

export class NotFoundError extends AppError{
    constructor(message = "Recurso no encontrado"){
        super(message, 404)
    }
}

export class BadRequestError extends AppError{
    constructor(message = "Datos inválidos"){
        super(message, 400)
    }
}
