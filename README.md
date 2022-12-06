Hosted at: https://tadeohepperle.com/dice-calculator-frontend/

# Advanced Dice Calculator and Dice Roller

Calculate Dice statistics and roll arbitrarily complex dice.
<img width="380" alt="image" src="https://user-images.githubusercontent.com/62739623/205859795-1ea3d5c7-5b38-40cc-b2b0-b9f66e043308.png">
<img width="538" alt="image" src="https://user-images.githubusercontent.com/62739623/205859851-edbf3cf7-6064-45ba-91e2-0328c0d8e374.png">
<img width="281" alt="image" src="https://user-images.githubusercontent.com/62739623/205859941-44d2ffc3-fd3e-4b2f-b257-5c117e5d3ca6.png">

Probability Mass function:
<img width="687" alt="image" src="https://user-images.githubusercontent.com/62739623/205860151-826f2979-098e-4f9f-a481-11eea9e3b8fb.png">
Probability Density function:
<img width="683" alt="image" src="https://user-images.githubusercontent.com/62739623/205860204-9ac738bf-e1a6-4094-be1d-70b77e368480.png">
Exact fractional probabilities with infinite precision:
<img width="744" alt="image" src="https://user-images.githubusercontent.com/62739623/205860958-c54bfe38-30be-4090-9736-2d80bd754015.png">


## Technology:
- uses Rust compiled to Web Assembly (see: https://github.com/tadeohepperle/dices)
- uses Web Assembly in Web Worker to not block the main thread
- Typescript, React, Redux for the frontend.

## Features:
- probability distributions (pmf and cdf)
- roller
- comparison of distributions in graph
- quantiles
