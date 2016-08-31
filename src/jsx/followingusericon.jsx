import React from 'react';

class FollowingUsersIcon extends React.Component{
  render(){
    return (
      <svg
        className="following-user-icon"
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        height="100px"
        width="125px"
        viewBox="0 0 100 125">
        <path
          d="M94.414,1.001C83.248,5.244,42.827,63.756,42.827,63.756L28.561,40.739l-12.298,7.398l21.652,33.261h9.602  c0,0,32.87-46.548,46.897-58.065V1.001z"
          fill={this.props.palette.followinguser}/>
        <path
          d="M6.62,83.479c0,5.394,4.373,9.768,9.768,9.768l52.468,0.062c5.395,0,9.768-4.373,9.768-9.768l-0.085-31.474h5.787v31.537  C84.325,92.107,77.433,99,68.93,99L15.76,98.938c-8.11,0-14.683-6.575-14.683-14.682L1,31.161c0-8.503,6.893-15.396,15.396-15.396  l48.809-0.079v5.794l-48.738-0.022c-5.394,0-9.768,4.372-9.768,9.768L6.62,83.479z"
          fill={this.props.palette.followinguser}/>
      </svg>
    )
  }
}

export default FollowingUsersIcon;
