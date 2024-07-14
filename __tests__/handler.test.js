const {deleteFactory, updateFactory, createFactory, getOneFactory, getAllFactory} = require("../controllers/handlerFactory");
const catchAsync=require('../utils/catchAsync');
const AppError = require("../utils/appError");
const {populate} = require("dotenv");
const APIfeature=require('../utils/APIFeature')
jest.mock('../utils/APIFeature')
let req,res,next,Model,populatMock;

beforeEach(()=> {
    populatMock=jest.fn();
    Model = {
        findByIdAndDelete: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        findById:jest.fn(()=>({
            populate:populatMock
        })),
        find:jest.fn().mockReturnValue({}),
    }
    req = {
        params: {
            id: 1,
            tourId:1,
            userId:1
        },
        body:{},
        query:{}
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
    const err=next.mock.calls[0][0];
    expect(err.message).toBe("document is not found");
    expect(err.statusCode).toBe(404);
    expect(res.status).not.toHaveBeenCalled();
    expect(res.json).not.toHaveBeenCalled();
}
const handleDatabaseError=async (factoryFunction,mockedFunction) => {
    mockedFunction.mockRejectedValueOnce(new Error('Database error'));
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

describe('Get one document factory',()=>{
    const populateOption={}
    it('should give you a document',async ()=>{
        const queryMock=jest.fn().mockResolvedValueOnce({})
        populatMock.mockReturnValueOnce(queryMock());
        await getOneFactory(Model,populateOption)(req,res,next);
        expect(Model.findById).toBeCalledWith(req.params.id);
        expect(populatMock).toBeCalledWith(populateOption);
        expect(res.status).toBeCalledWith(200);
        const returned_obj=res.json.mock.calls[0][0];
        expect(returned_obj.status).toBe("success");
    })
    it('shouldn\'t found the document and return 404',async ()=>{
        const queryMock=jest.fn().mockResolvedValueOnce()
        populatMock.mockReturnValueOnce(queryMock());
        await getOneFactory(Model,populateOption)(req,res,next);
        expect(Model.findById).toBeCalledWith(req.params.id);
        expect(populatMock).toBeCalledWith(populateOption);
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toBeCalledWith(expect.any(AppError));
    })
    it('should handle errors thrown by findById',async ()=>{
        const queryMock=jest.fn().mockRejectedValueOnce(new Error('Database error'))
        populatMock.mockReturnValueOnce(queryMock());
        await getOneFactory(Model,populateOption)(req,res,next);
        expect(Model.findById).toBeCalledWith(req.params.id);
        expect(populatMock).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
        expect(next).toHaveBeenCalled();
        const return_error=next.mock.calls[0][0];
        expect(return_error.message).toBe("Database error")
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    })
})

const apiMockedObj={
    filter:jest.fn().mockReturnThis(),
    sort:jest.fn().mockReturnThis(),
    paginate:jest.fn().mockReturnThis(),
    limitFields:jest.fn().mockReturnThis(),
}
describe('Get all documents factory', ()=>{
    it('should return all documents filtered',async()=>{
        apiMockedObj.query=jest.fn().mockResolvedValueOnce([{doc1:1},{doc2:2}])()
        const apiFeatureMockedFn=jest.fn(()=>apiMockedObj)
        APIfeature.mockImplementationOnce(apiFeatureMockedFn);
        await getAllFactory(Model)(req,res,next);
        expect(Model.find).toBeCalledWith({user:req.params.userId})
        expect(res.status).toBeCalledWith(200);
        const returned_obj=res.json.mock.calls[0][0];
        expect(returned_obj.status).toBe("success");
        const apiFeatuerArgs=apiFeatureMockedFn.mock.calls[0];
        expect(apiFeatuerArgs[0]).toStrictEqual({});
        expect(apiFeatuerArgs[1]).toStrictEqual({});
    })
    it('should handle errors thrown APIfeaturesby database',async()=>{
        // apiMockedFn.query=jest.fn().mockRejectedValueOnce('Database error')()
        apiMockedObj.query=jest.fn().mockRejectedValueOnce(new Error("Database error"))()
        const apiFeatureMockedFn=jest.fn(()=>apiMockedObj)
        APIfeature.mockImplementationOnce(apiFeatureMockedFn);
        await getAllFactory(Model)(req,res,next);
        expect(Model.find).toBeCalledWith({user:req.params.userId})
        expect(next).toHaveBeenCalled();
        const return_error=next.mock.calls[0][0];
        expect(return_error.message).toBe("Database error")
        expect(res.status).not.toHaveBeenCalled();
        expect(res.json).not.toHaveBeenCalled();
    })
})