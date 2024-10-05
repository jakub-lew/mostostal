use std::error::Error;

pub type GenError<T> = Result<T, Box<dyn Error>>;
