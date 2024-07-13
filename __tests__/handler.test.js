const {deleteFactory, updateFactory, createFactory, getOneFactory, getAllFactory} = require("../controllers/handlerFactory");
const catchAsync=require('../utils/catchAsync');
const AppError = require("../utils/appError");

let req,res,next,Model;
beforeEach(()=> {
    Model = {
        findByIdAndDelete: jest.fn()
    }
    req = {
        params: {
            id: 1
        }
    }
    res = {
        status: jest.fn().mockReturnThis(),//return res
        json: jest.fn().mockReturnThis(),//return res
    }
    next = jest.fn();
});

describe("Delete document factory",()=>{
    it("should delete the documents",async ()=>{
        Model.findByIdAndDelete.mockResolvedValueOnce({msg:"document to delete"});
        await deleteFactory(Model)(req,res,next);
        expect(res.status).toBeCalledWith(204);
        expect(res.json).toBeCalledWith({
            status:"success",
            data:null,
        })
        expect(Model.findByIdAndDelete).toBeCalledWith(req.params.id);
    })
    it('shouldn\'t found the document and return 404',async ()=>{
        Model.findByIdAndDelete.mockResolvedValueOnce(null);
        await deleteFactory(Model)(req,res,next);
        //expect.any(constructor) s a matcher in Jest that allows you to test
        // that a value is of a certain type without needing to specify the exact value.
        expect(next).toBeCalledWith(expect.any(AppError));
        const error=next.mock.calls[0][0];
        expect(error.message).toBe("document is not found");
        expect(error.statusCode).toBe(404);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    })
    it('should handle errors thrown by findByIdAndDelete', async () => {
        const error = new Error('Database error');
        Model.findByIdAndDelete.mockRejectedValueOnce(error);
        await deleteFactory(Model)(req, res, next);

        expect(Model.findByIdAndDelete).toHaveBeenCalledWith(1);
        expect(next).toHaveBeenCalledWith(expect.any(Error));
        const return_error=next.mock.calls[0][0];
        expect(return_error.message).toBe("Database error")
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    });
})
