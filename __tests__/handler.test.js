const {deleteFactory, updateFactory, createFactory, getOneFactory, getAllFactory} = require("../controllers/handlerFactory");
const catchAsync=require('../utils/catchAsync');
const AppError = require("../utils/appError");

let req,res,next,Model;
beforeEach(()=> {
    Model = {
        findByIdAndDelete: jest.fn(),
        findByIdAndUpdate: jest.fn()
    }
    req = {
        params: {
            id: 1
        },
        body:{}
    }
    res = {
        status: jest.fn().mockReturnThis(),//return res
        json: jest.fn().mockReturnThis(),//return res
    }
    next = jest.fn();
});
const handleCorrectPath=async (factoryFunction,mockedFunction,successCode)=>{
    mockedFunction.mockResolvedValueOnce({msg:"document"});
    await factoryFunction(Model)(req,res,next);
    expect(res.status).toBeCalledWith(successCode);
    const response=res.json.mock.calls[0][0]
    expect(response.status).toBe("success");
    const reqParamsId=mockedFunction.mock.calls[0][0];
    expect(reqParamsId).toBe(req.params.id);
}
const handleNotFoundPath=async (factoryFunction,mockedFunction)=>{
    mockedFunction.mockResolvedValueOnce(null);
    await factoryFunction(Model)(req,res,next);
    //expect.any(constructor) s a matcher in Jest that allows you to test
    // that a value is of a certain type without needing to specify the exact value.
    expect(next).toBeCalledWith(expect.any(AppError));
    const error=next.mock.calls[0][0];
    expect(error.message).toBe("document is not found");
    expect(error.statusCode).toBe(404);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
}
const handleDatabaseError=async (factoryFunction,mockedFunction) => {
    const error = new Error('Database error');
    mockedFunction.mockRejectedValueOnce(error);
    await factoryFunction(Model)(req, res, next);
    expect(mockedFunction).toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.any(Error));
    const return_error=next.mock.calls[0][0];
    expect(return_error.message).toBe("Database error")
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
}
describe("Delete document factory",()=>{
    it("should delete the documents",async ()=>{
        await handleCorrectPath(deleteFactory,Model.findByIdAndDelete,204);
    })
    it('shouldn\'t found the document and return 404',async ()=>{
        await handleNotFoundPath(deleteFactory,Model.findByIdAndDelete)
    })
    it('should handle errors thrown by findByIdAndDelete', async () => {
        await handleDatabaseError(deleteFactory,Model.findByIdAndDelete)
    });
})
describe('Update document factory',()=>{
    it("should update the documents",async ()=>{
        await handleCorrectPath(updateFactory,Model.findByIdAndUpdate,200);
    })
    it('shouldn\'t found the document and return 404',async ()=>{
        await handleNotFoundPath(updateFactory,Model.findByIdAndUpdate)
    })
    it('should handle errors thrown by findByIdAndDelete', async () => {
        await handleDatabaseError(updateFactory,Model.findByIdAndUpdate)
    });
})