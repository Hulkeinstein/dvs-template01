import CounterData from "../../data/elements/counter.json";
import CounterWrap from "./CounterWrap";

const CounterFive = () => {
  return (
    <div className="container">
      {CounterData &&
        CounterData.counterFive.map((data, index) => (
          <div className="row g-5" key={index}>
            {data.body.map((item, innerIndex) => (
              <div
                className="col-lg-3 col-md-6 col-sm-6 col-12 single-counter"
                key={innerIndex}
              >
                <div className="rbt-counterup style-2">
                  <div className="inner">
                    <div className="content">
                      <h3 className="counter">
                        <span className="odometer">
                          <CounterWrap value={item.num} format="(d)" />
                        </span>
                      </h3>
                      <span className="subtitle">{data.text}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
    </div>
  );
};

export default CounterFive;
