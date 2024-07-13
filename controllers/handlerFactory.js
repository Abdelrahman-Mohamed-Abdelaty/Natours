const APIFeature=require("../utils/APIFeature")
const catchAsync=require("../utils/catchAsync")
const AppError=require("../utils/appError")
const Tour = require("../models/tour");
exports.deleteFactory=Model=>catchAsync (async (req,res,next)=>{
    const doc= await Model.findByIdAndDelete(req.params.id);
    if(!doc){
        return next(new AppError("document is not found",404));
    }
    res.status(204).json({
        status:"success",
        data:null,
    })
})

exports.createFactory=Model=>catchAsync (async (req,res,next)=>{
    const document=await Model.create(req.body);
    res.status(201).json({
        status:"success",
        data:{
            document
        }
    })
})
exports.updateFactory=Model=>catchAsync(async (req,res,next)=>{
    const doc= await Model.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
    });
    if(!doc){
        return next(new AppError("document is not found",404));
    }
    res.status(200).json({
        status:"success",
        data:{
            document:doc
        }
    })
})
exports.getOneFactory=(Model,populatOptions)=>catchAsync (async (req,res,next)=>{
    let query=  Model.findById(req.params.id);
    if(populatOptions){
        query=query.populate(populatOptions);
    }
    const document=await query;
    if(!document){
        return next(new AppError("document is not found",404));
    }
    res.status(200).json({
        status:"success",
        data:{
            document
        }
    })
})
exports.getAllFactory=Model=>catchAsync(async (req,res,next)=>{
    let filerObj={};
    if(req.params.tourId) filerObj={tour:req.params.tourId};
    if(req.params.userId) filerObj={user:req.params.userId};

    const apiFeature= new APIFeature(Model.find(filerObj),req.query)
        .filter()
        .sort()
        .paginate()
        .limitFields();
    const document=await apiFeature.query;
    res.status(200).json({
        status:"success",
        results:document.length,
        data:{
            document
        }
    })
});