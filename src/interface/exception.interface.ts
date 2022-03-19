import { HttpException, InternalServerErrorException } from "@nestjs/common";

export class Exception {
    public static InternalServerError(): HttpException {
        return new InternalServerErrorException("Something Wrong With Server", "Internal Server Error");
    }
}