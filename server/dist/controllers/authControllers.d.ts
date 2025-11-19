import type { Request, Response } from "express";
export declare function registerUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function loginUser(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function welcome(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
//# sourceMappingURL=authControllers.d.ts.map