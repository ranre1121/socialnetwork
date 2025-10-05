import type { Request, Response } from "express";
export declare function addPost(req: Request, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare function getFeedPosts(req: any, res: Response): Promise<Response<any, Record<string, any>> | undefined>;
export declare const deletePost: (req: any, res: Response) => Response<any, Record<string, any>> | undefined;
//# sourceMappingURL=postsControllers.d.ts.map