import type { Request, Response } from "express";
export declare function addPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getFeedPosts(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePost(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function likePost(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=postsControllers.d.ts.map