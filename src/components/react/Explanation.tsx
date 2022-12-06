const Explanation = () => {
  return (
    <div className="textdiv p-1">
      <h2>Syntax for Specifying Dice</h2>
      You can combine the following symbols in order to create interesting
      distributions for games and statistical questions.
      <ul>
        <li>
          <b>20</b> Numeric Constants.
        </li>
        <li>
          <b>d6</b> Fair Dice. Uniform distribution from 1 until 6, 20 and 100
          inclusive respectively.
        </li>
        <li>
          <b>*</b> Multiplication. Example: d6*d6 could be 36 if we roll a 6 two
          times, but it can never be 35. 2*d6 can never be 11, while 2d6 can be.
        </li>
        <li>
          <b style={{ marginRight: 4 }}>+</b> <b>-</b> Addition and
          Substraction. Example: d6+d6 is the same as often denoted as 2d6.
          d20-d20 is the difference between two 20-sided dice.
        </li>
        <li>
          <b>x</b> Multiaddition. Example: 2xd6 is the same as often denoted as
          2d6. It is rolling two dice. d2xd6 is saying, we roll a d2, either
          giving 1 or 2 and then rolling a d6 that many times adding up the
          results. This operator is left-assosiative. When two factors like
          Constants (6) or Dice (d20) follow each other without an operator
          between, a x is automatically inserted between them. That means 3d20 =
          3xd20 = d20+d20+d20. For Constants: a x b = a * b (e.g. 5 x 3 = 5 * 3)
        </li>
        <li>
          <b>/</b> Division. Values are divided and rounded to the next integer.
          For example d6/2 = d3 . The value range of d6/3 however is [0,1,2].
          Also left-associative.
        </li>
        <li>
          <b>max(x, y, ...)</b> The maximum of some comma-separated values. For
          example max(d6,d6) is throwing 2 dice and just keeping the highest.
        </li>
        <li>
          <b>min(x, y, ...)</b> The minimum of some comma-separated values. For
          example min(d6,d6) is throwing 2 dice and just keeping the lowest.
        </li>
        <li>
          <b>abs(x)</b> The absolute value of x. For a probability distribution,
          the probability of each negative value is added to the probability of
          the corresponding positive value. Example: for abs(d6-3) the
          probability of 2 is 1/3, because for d6-3 the probability of 2 is 1/6
          and of -2 is also 1/6. 1/6 + 1/6 = 1/3.
        </li>
      </ul>
      <h2>Details</h2>
      <ul>
        <li>
          <b>Integers</b> All values the dice can take are limited to integers.
          Even the divide operator rounds everything to integers. Also inputting
          non-integers will return errors and not compute a distribution.
        </li>
        <li>
          <b>Fractions</b> Probabilities are computed as mathematically accurate
          fractions with infinite precision. You can however see them as decimal
          values as well in the table and the chart. This design decision allows
          for accuracy, though sacrificing a lot of performance. It's a
          tradeoff. Input e.g. 40d6 and hover over the graph to see how precise
          these fractions can get.
        </li>
        <li>
          <b>Precedence</b> The operators in order by their precedence (highest
          to lowest): x, *, /, +/-. You can use Brackets to explicitly control
          the order of evaluation if you are not sure.
        </li>
      </ul>
      <h2>Performance Limitations and Background</h2>
      In general, if the number of different values the distribution has,
      exceeds ca. 1000 you might have to wait longer than 1-3 seconds until the
      computation is complete. Computation could be roughly 100x faster if we
      used only floats for probabilities, but I chose to use fractions with
      infinite precision to keep everything mathematically accurate. Also for
      highly convoluted distributions even 64-floats will become 0.0 very fast
      and do not tell us anything.
      <br />
      Rolling dice (even 1000 at once) is pretty cheap though even for very
      complex distributions and can be usually done in a couple of milliseconds
      in the webbrowsers worker thread that is using Web Assembly.
      <h2>Rust and Web Assembly</h2>
      This project uses the
      <a href="https://crates.io/crates/dices">Rust Dices Library</a> that I
      wrote with the goal in mind to make it compile to WebAssembly. The web-app
      you see spins up a separate worker thread which interops with WebAssembly.
      In this way the main thread is not blocked, even during heavy
      computations.
    </div>
  );
};

export default Explanation;
