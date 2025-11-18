import type { Request, Response } from "express";
export declare function addPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getFeedPosts(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deletePost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function likePost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function addComment(req: Request, res: Response): Promise<Response<any, Record<string, any>>>;
export declare function getComments(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function deleteComment(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=postsControllers.d.ts.map