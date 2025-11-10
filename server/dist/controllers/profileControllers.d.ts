import type { Request, Response } from "express";
interface MulterRequest extends Request {
    file?: Express.Multer.File;
}
export declare function getProfile(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare const uploadProfilePic: import("express").RequestHandler<import("express-serve-static-core").ParamsDictionary, any, any, import("qs").ParsedQs, Record<string, any>>;
export declare function updateProfile(req: MulterRequest, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export {};
//# sourceMappingURL=profileControllers.d.ts.map